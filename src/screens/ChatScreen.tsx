import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../store/appStore';
import { C, R, S, F } from '../theme';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

interface Props {
  onBack?: () => void;
}

interface ChatSummary {
  _id: string;
  participants: { _id: string; name: string; role: string }[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  messages: any[];
}

// ── Admin: lista de conversas ────────────────────────────────────────────────
function AdminChatList({ onSelectChat, onBack }: { onSelectChat: (chat: ChatSummary) => void; onBack?: () => void }) {
  const [chats, setChats]     = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat')
      .then((r) => setChats(r.data.chats || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getClientName = (chat: ChatSummary) => {
    const client = chat.participants.find((p) => p.role !== 'admin');
    return client?.name || 'Cliente';
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBase }}>
      {/* Header */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ position: 'absolute', top: 0, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: C.amber, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {!!onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}
            >
              <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={{ color: C.textSecondary, fontSize: 13, fontFamily: F.base }}>Atendimento</Text>
            <Text style={{ color: C.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.5, fontFamily: F.base }}>Conversas</Text>
          </View>
        </View>
        <View style={{ width: 28, height: 2, backgroundColor: C.amber, borderRadius: 1, marginTop: 8, opacity: 0.9 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.amber} />
        </View>
      ) : chats.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.amberGlow, borderWidth: 1.5, borderColor: C.amber + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="chatbubbles-outline" size={34} color={C.amber} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, fontFamily: F.base }}>Nenhuma conversa</Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 6, textAlign: 'center', fontFamily: F.base }}>
            As mensagens dos clientes aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const name = getClientName(item);
            const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
            const unread = item.messages?.length || 0;
            return (
              <TouchableOpacity
                onPress={() => onSelectChat(item)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  paddingHorizontal: S.md, paddingVertical: 14,
                  borderBottomWidth: 1, borderBottomColor: C.border,
                }}
              >
                {/* Avatar */}
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: C.amber + '25', borderWidth: 1.5, borderColor: C.amber + '60', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.amber, fontSize: 16, fontWeight: '800', fontFamily: F.base }}>{initials}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: F.base }}>{name}</Text>
                  <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 2, fontFamily: F.base }} numberOfLines={1}>
                    {item.lastMessage || 'Sem mensagens'}
                  </Text>
                </View>

                {/* Time + arrow */}
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {item.lastMessageAt && (
                    <Text style={{ fontSize: 11, color: C.textDisabled, fontFamily: F.base }}>{formatTime(item.lastMessageAt)}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={C.textDisabled} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ── Chat messages view (shared by client and admin) ──────────────────────────
function ChatMessages({
  chatId,
  userId,
  isAdmin,
  onBack,
  clientName,
}: {
  chatId: string;
  userId: string;
  isAdmin: boolean;
  onBack: () => void;
  clientName?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatRef   = useRef<FlatList>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join', userId);
    socket.emit('join_chat', chatId);

    api.get(`/chat/${chatId}`)
      .then((r) => setMessages(r.data.chat.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev; // dedup
        return [...prev, msg];
      });
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => { socket.disconnect(); };
  }, [chatId]);

  const sendMessage = async () => {
    const msgText = text.trim();
    if (!msgText || sending) return;
    setText('');
    setSending(true);
    try {
      const res = await api.post(`/chat/${chatId}/messages`, { content: msgText, type: 'text' });
      const newMsg = res.data.message;
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev; // dedup
        return [...prev, newMsg];
      });
      socketRef.current?.emit('send_message', { chatId, message: newMsg });
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { setText(msgText); }
    finally { setSending(false); }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe     = item.sender._id === userId;
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isMe && (!prevItem || prevItem.sender._id !== item.sender._id);
    const time     = new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={{ marginBottom: 4, paddingHorizontal: S.md }}>
        <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
          {!isMe && (
            <View style={{ width: 30, height: 30, marginBottom: 2, opacity: showAvatar ? 1 : 0 }}>
              {isAdmin ? (
                // Admin sees client initial
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.blue + '30', borderWidth: 1.5, borderColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.blue, fontSize: 12, fontWeight: '800', fontFamily: F.base }}>
                    {(clientName || 'C')[0].toUpperCase()}
                  </Text>
                </View>
              ) : (
                // Client sees company logo initial
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.amber + '30', borderWidth: 1.5, borderColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: C.amber, fontSize: 12, fontWeight: '800', fontFamily: F.base }}>A</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ maxWidth: '75%' }}>
            {item.type === 'image' && item.image?.url && (
              <Image source={{ uri: item.image.url }} style={{ width: 200, height: 150, borderRadius: R.md, marginBottom: 2 }} resizeMode="cover" />
            )}
            {item.content ? (
              <View style={{
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                backgroundColor: isMe ? C.amber : C.bgSurface,
                borderBottomRightRadius: isMe ? 4 : 20,
                borderBottomLeftRadius: isMe ? 20 : 4,
                borderWidth: isMe ? 0 : 1, borderColor: isMe ? 'transparent' : C.border,
              }}>
                <Text style={{ color: isMe ? '#fff' : C.textPrimary, fontSize: 15, lineHeight: 21, fontFamily: F.base }}>
                  {item.content}
                </Text>
                <Text style={{ color: isMe ? 'rgba(255,255,255,0.6)' : C.textDisabled, fontSize: 10, marginTop: 4, textAlign: isMe ? 'right' : 'left', fontFamily: F.base }}>
                  {time} {isMe && '✓'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const hasText = text.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: C.bgBase }}
    >
      {/* Header */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ position: 'absolute', top: 0, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: C.amber, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={onBack} style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>

          {isAdmin ? (
            // Admin header: client info
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue + '25', borderWidth: 2, borderColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.blue, fontSize: 16, fontWeight: '800', fontFamily: F.base }}>
                {(clientName || 'C')[0].toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={{ borderRadius: 24, overflow: 'hidden', width: 44, height: 44, borderWidth: 2, borderColor: C.amber }}>
              <Image source={require('../../assets/logo-pintura.jpeg')} style={{ width: 44, height: 44 }} resizeMode="cover" />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '800', fontFamily: F.base }}>
              {isAdmin ? (clientName || 'Cliente') : 'A. Coraça & T. Carvalho'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.success }} />
              <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>
                {isAdmin ? 'Mensagens do cliente' : 'Online agora'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.amber} />
          <Text style={{ color: C.textSecondary, marginTop: 12, fontSize: 14, fontFamily: F.base }}>Carregando conversa...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m._id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: S.md, paddingBottom: S.sm }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.amberGlow, borderWidth: 1.5, borderColor: C.amber + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Ionicons name="chatbubbles-outline" size={36} color={C.amber} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 6, fontFamily: F.base }}>
                {isAdmin ? 'Nenhuma mensagem ainda' : 'Inicie uma conversa'}
              </Text>
              <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20, fontFamily: F.base }}>
                {isAdmin ? 'Responda ao cliente abaixo.' : 'Tire dúvidas, solicite informações ou acompanhe seu serviço.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: S.md, paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        backgroundColor: C.bgSurface,
        borderTopWidth: 1, borderTopColor: C.border,
      }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'flex-end',
          backgroundColor: C.bgElevated, borderRadius: 24,
          paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
          borderWidth: 1.5, borderColor: hasText ? C.amber + '55' : C.border,
        }}>
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.textPrimary, maxHeight: 100, paddingVertical: 6, lineHeight: 20, fontFamily: F.base }}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={C.textDisabled}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity onPress={sendMessage} disabled={!hasText || sending} activeOpacity={0.85} style={{ marginBottom: 2 }}>
          <LinearGradient
            colors={hasText ? [C.amberDeep, C.amber] : [C.bgElevated, C.bgElevated]}
            style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: hasText ? 0 : 1, borderColor: C.border }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={hasText ? '#fff' : C.textDisabled} />
            ) : (
              <Ionicons name="send" size={18} color={hasText ? '#fff' : C.textDisabled} style={{ marginLeft: 2 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function ChatScreen({ onBack }: Props) {
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [chatId, setChatId]       = useState('');
  const [clientName, setClientName] = useState('');
  const [initLoading, setInitLoading] = useState(!isAdmin); // clients need to init chat

  // ── Client: auto-create or find their chat ──
  useEffect(() => {
    if (isAdmin) return;
    const initChat = async () => {
      try {
        const res = await api.post('/chat', {});
        setChatId(res.data.chat._id);
      } catch { }
      finally { setInitLoading(false); }
    };
    initChat();
  }, []);

  // ── Admin: show list until a chat is selected ──
  if (isAdmin) {
    if (!chatId) {
      return (
        <AdminChatList
          onBack={onBack}
          onSelectChat={(chat) => {
            const client = chat.participants.find((p) => p.role !== 'admin');
            setClientName(client?.name || 'Cliente');
            setChatId(chat._id);
          }}
        />
      );
    }
    // Admin opened a specific chat
    return (
      <ChatMessages
        chatId={chatId}
        userId={user!._id}
        isAdmin
        clientName={clientName}
        onBack={() => setChatId('')}
      />
    );
  }

  // ── Client view ──
  if (initLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.amber} />
      </View>
    );
  }

  if (!chatId) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bgBase, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="wifi-outline" size={48} color={C.textDisabled} />
        <Text style={{ color: C.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center', fontFamily: F.base }}>
          Não foi possível conectar ao chat. Tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <ChatMessages
      chatId={chatId}
      userId={user!._id}
      isAdmin={false}
      onBack={onBack || (() => {})}
    />
  );
}

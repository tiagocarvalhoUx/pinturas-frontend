import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator,
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

export function ChatScreen({ onBack }: Props) {
  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]         = useState('');
  const [chatId, setChatId]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatRef   = useRef<FlatList>(null);
  const inputRef  = useRef<TextInput>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join', user?._id);

    const initChat = async () => {
      try {
        let id = chatId;
        if (!id) {
          const res = await api.post('/chat', {});
          id = res.data.chat._id;
          setChatId(id);
        }
        const res = await api.get(`/chat/${id}`);
        setMessages(res.data.chat.messages || []);
        socket.emit('join_chat', id);
      } catch { /* chat not available */ }
      finally { setLoading(false); }
    };
    initChat();

    socket.on('new_message', (msg: ChatMessage) => {
      if (msg.sender._id !== user?._id) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendMessage = async () => {
    const msgText = text.trim();
    if (!msgText || !chatId || sending) return;
    setText('');
    setSending(true);
    try {
      const res = await api.post(`/chat/${chatId}/messages`, { content: msgText, type: 'text' });
      const newMsg = res.data.message;
      setMessages((prev) => [...prev, newMsg]);
      socketRef.current?.emit('send_message', { chatId, message: newMsg });
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { setText(msgText); }
    finally { setSending(false); }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe       = item.sender._id === user?._id;
    const prevItem   = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isMe && (!prevItem || prevItem.sender._id !== item.sender._id);
    const time       = new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={{ marginBottom: 4, paddingHorizontal: S.md }}>
        <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
          {!isMe && (
            <View style={{ width: 30, height: 30, marginBottom: 2, opacity: showAvatar ? 1 : 0 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.amber + '30', borderWidth: 1.5, borderColor: C.amber, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.amber, fontSize: 12, fontWeight: '800', fontFamily: F.base }}>A</Text>
              </View>
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
                borderWidth: isMe ? 0 : 1,
                borderColor: isMe ? 'transparent' : C.border,
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
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={{ backgroundColor: C.bgDeep, paddingTop: 52, paddingHorizontal: S.md, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ position: 'absolute', top: 0, right: -10, width: 180, height: 180, borderRadius: 90, backgroundColor: C.amber, opacity: 0.05 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}>
              <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={{ borderRadius: 24, overflow: 'hidden', width: 44, height: 44, borderWidth: 2, borderColor: C.amber }}>
            <Image source={require('../../assets/logo-pintura.jpeg')} style={{ width: 44, height: 44 }} resizeMode="cover" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '800', fontFamily: F.base }}>A. Coraça & T. Carvalho</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.success }} />
              <Text style={{ color: C.textSecondary, fontSize: 12, fontFamily: F.base }}>Online agora</Text>
            </View>
          </View>
          <TouchableOpacity style={{ backgroundColor: C.bgElevated, borderRadius: R.sm, padding: 9, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="information-circle-outline" size={22} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Messages ── */}
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
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: C.amberGlow, borderWidth: 1.5, borderColor: C.amber + '40',
                alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              }}>
                <Ionicons name="chatbubbles-outline" size={36} color={C.amber} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary, marginBottom: 6, fontFamily: F.base }}>Inicie uma conversa</Text>
              <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20, fontFamily: F.base }}>
                Tire dúvidas, solicite informações ou acompanhe seu serviço.
              </Text>
            </View>
          }
        />
      )}

      {/* ── Input bar ── */}
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
            ref={inputRef}
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
            style={{
              width: 46, height: 46, borderRadius: 23,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: hasText ? 0 : 1, borderColor: C.border,
            }}
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

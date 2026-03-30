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

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

interface Props {
  onBack?: () => void;
}

export function ChatScreen({ onBack }: Props) {
  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join', user?._id);

    const initChat = async () => {
      try {
        // Try to get existing chat or create one
        let id = chatId;
        if (!id) {
          const res = await api.post('/chat', {});
          id = res.data.chat._id;
          setChatId(id);
        }
        const res = await api.get(`/chat/${id}`);
        setMessages(res.data.chat.messages || []);
        socket.emit('join_chat', id);
      } catch {
        // chat not available
      } finally {
        setLoading(false);
      }
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
    } catch {
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.sender._id === user?._id;
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isMe && (!prevItem || prevItem.sender._id !== item.sender._id);
    const time = new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={{ marginBottom: 4, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
          {/* Avatar for other side */}
          {!isMe && (
            <View style={{ width: 30, height: 30, marginBottom: 2, opacity: showAvatar ? 1 : 0 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>A</Text>
              </View>
            </View>
          )}

          <View style={{ maxWidth: '75%' }}>
            {/* Image message */}
            {item.type === 'image' && item.image?.url && (
              <Image
                source={{ uri: item.image.url }}
                style={{ width: 200, height: 150, borderRadius: 16, marginBottom: 2 }}
                resizeMode="cover"
              />
            )}

            {/* Text bubble */}
            {item.content ? (
              <View style={{
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                backgroundColor: isMe ? '#2563EB' : '#fff',
                borderBottomRightRadius: isMe ? 4 : 20,
                borderBottomLeftRadius: isMe ? 20 : 4,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
              }}>
                <Text style={{ color: isMe ? '#fff' : '#1e293b', fontSize: 15, lineHeight: 21 }}>
                  {item.content}
                </Text>
                <Text style={{ color: isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8', fontSize: 10, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                  {time} {isMe && '✓'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderDateSeparator = (date: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 16 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
      <Text style={{ fontSize: 11, color: '#94a3b8', marginHorizontal: 10, fontWeight: '600' }}>{date}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <LinearGradient colors={['#1d4ed8', '#2563EB', '#3b82f6']} style={{ paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Avatar */}
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>🖌️</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>A. Coraça & T. Carvalho</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#34d399' }} />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Online agora</Text>
            </View>
          </View>

          <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 14 }}>Carregando conversa...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m._id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="chatbubbles-outline" size={38} color="#93c5fd" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 6 }}>Inicie uma conversa</Text>
              <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 }}>
                Tire dúvidas, solicite informações ou acompanhe seu serviço.
              </Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 5,
      }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'flex-end',
          backgroundColor: '#f1f5f9', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6,
          marginRight: 8,
        }}>
          <TextInput
            ref={inputRef}
            style={{ flex: 1, fontSize: 15, color: '#1e293b', maxHeight: 100, paddingVertical: 6, lineHeight: 20 }}
            placeholder="Digite uma mensagem..."
            placeholderTextColor="#94a3b8"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          activeOpacity={0.85}
          style={{ marginBottom: 2 }}
        >
          <LinearGradient
            colors={text.trim() ? ['#2563EB', '#1d4ed8'] : ['#e2e8f0', '#e2e8f0']}
            style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color={text.trim() ? '#fff' : '#94a3b8'} style={{ marginLeft: 2 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

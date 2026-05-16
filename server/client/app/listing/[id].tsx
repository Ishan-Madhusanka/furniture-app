import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.2:5000';
const { width } = Dimensions.get('window');

export default function ListingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    fetch(`${API_URL}/api/listings/${id}`)
      .then(res => res.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, [id]);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const handleDelete = async () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/listings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            Alert.alert('Deleted!');
            router.push('/');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const isOwner = user && listing.seller?._id === user.id;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {listing.images && listing.images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={16}
        >
          {listing.images.map((img: string, index: number) => (
            <Image key={index} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Images</Text>
        </View>
      )}

      {listing.images && listing.images.length > 1 && (
        <View style={styles.dots}>
          {listing.images.map((_: any, i: number) => (
            <View key={i} style={[styles.dot, activeImage === i && styles.dotActive]} />
          ))}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.category}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.condition}</Text>
          </View>
        </View>

        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>Rs. {listing.price.toLocaleString()}</Text>
        <Text style={styles.location}>📍 {listing.location}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Seller</Text>
        <Text style={styles.sellerName}>👤 {listing.seller?.name}</Text>

        {listing.sellerPhone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${listing.sellerPhone}`)}
          >
            <Text style={styles.callBtnText}>📞 Call Seller — {listing.sellerPhone}</Text>
          </TouchableOpacity>
        )}

        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/listing/edit/${id}`)}>
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width, height: 300, resizeMode: 'cover' },
  noImage: { width, height: 300, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: '#aaa' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#2ecc71', width: 18 },
  content: { padding: 20 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { backgroundColor: '#e8f8f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#2ecc71', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '800', color: '#2ecc71', marginBottom: 8 },
  location: { fontSize: 14, color: '#888' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 22 },
  sellerName: { fontSize: 15, color: '#333', marginBottom: 16 },
  callBtn: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ownerActions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  editBtn: { flex: 1, backgroundColor: '#3498db', padding: 14, borderRadius: 12, alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteBtn: { flex: 1, backgroundColor: '#ff4757', padding: 14, borderRadius: 12, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 12, alignItems: 'center' },
  backBtnText: { color: '#555', fontSize: 15, fontWeight: '600' },
});
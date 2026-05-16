import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.2:5000';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadListings();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const loadListings = () => {
    fetch(`${API_URL}/api/listings`)
      .then(res => res.json())
      .then(data => { setListings(data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🪑 FurniMart</Text>
          <Text style={styles.headerSub}>Buy & Sell Furniture</Text>
        </View>
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Button */}
      {user && (
        <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/post')}>
          <Text style={styles.postText}>＋  Post Furniture</Text>
        </TouchableOpacity>
      )}

      {/* Listings */}
      <FlatList
        data={listings}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/listing/${item._id}`)}>
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
            ) : (
              <View style={styles.noImage}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{item.category}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardPrice}>Rs. {item.price.toLocaleString()}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardLocation}>📍 {item.location}</Text>
                <Text style={styles.cardCondition}>{item.condition}</Text>
              </View>
              {item.seller?.phone && (
                <Text style={styles.cardPhone}>📞 {item.seller.phone}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  loginBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  logoutBtn: { backgroundColor: '#ff4757', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  postBtn: { margin: 16, backgroundColor: '#2ecc71', padding: 14, borderRadius: 12, alignItems: 'center', elevation: 3 },
  postText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, elevation: 3, overflow: 'hidden' },
  cardImage: { width: '100%', height: 220, resizeMode: 'cover' },
  noImage: { width: '100%', height: 220, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: '#aaa', fontSize: 14 },
  cardBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#2ecc71', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  cardBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  cardPrice: { fontSize: 20, fontWeight: '800', color: '#2ecc71', marginTop: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardLocation: { fontSize: 13, color: '#888' },
  cardCondition: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  cardPhone: { fontSize: 13, color: '#2ecc71', marginTop: 6 },
});
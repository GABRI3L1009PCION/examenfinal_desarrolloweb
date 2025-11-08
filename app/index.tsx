import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Photo = {
    id: string;
    author: string;
    download_url: string;
};

// ancho para 2 columnas con paddings
const GAP = 12;
const COLS = 2;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - GAP * (COLS + 1)) / COLS;

export default function Index() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = async () => {
        try {
            setError(null);
            const res = await axios.get<Photo[]>('https://picsum.photos/v2/list?page=1&limit=30');
            setPhotos(res.data);
        } catch (e) {
            setError('No se pudieron cargar las imágenes.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPhotos();
    }, []);

    // 👇 Aquí está la corrección clave: miniatura optimizada
    const renderItem = ({ item }: { item: Photo }) => {
        const thumbUrl = `https://picsum.photos/id/${item.id}/400/400`;

        return (
            <View style={styles.card}>
                <Image source={{ uri: thumbUrl }} style={styles.image} />
                <View style={styles.meta}>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.sub}>ID: {item.id}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>Cargando galería…</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Galería de Fotos</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={photos}
                keyExtractor={(it) => it.id}
                renderItem={renderItem}
                numColumns={COLS}
                columnWrapperStyle={{ gap: GAP, paddingHorizontal: GAP }}
                contentContainerStyle={{ paddingVertical: GAP }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f7fb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 10 },
    error: {
        backgroundColor: '#ffe5e5',
        color: '#b00020',
        margin: 12,
        padding: 8,
        borderRadius: 8,
        textAlign: 'center',
    },
    card: {
        width: CARD_W,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: GAP,
        elevation: 3,
    },
    image: { width: '100%', aspectRatio: 1 },
    meta: { padding: 10 },
    author: { fontSize: 16, fontWeight: '700' },
    sub: { fontSize: 12, color: '#667085', marginTop: 2 },
});

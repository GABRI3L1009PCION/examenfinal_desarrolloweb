import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

// 🎨 Paleta de colores
const COLOR_VINO = '#7B1E3A';
const COLOR_FONDO = '#F7F3F4';
const COLOR_TEXTO = '#2C2C2C';

type Photo = {
    id: string;
    author: string;
    download_url: string;
};

// 📐 Configuración de diseño (2 columnas)
const GAP = 12;
const COLS = 2;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - GAP * (COLS + 1)) / COLS;

export default function Index() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔄 Obtener fotos desde la API
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

    // 🖼️ Miniaturas optimizadas
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
                <ActivityIndicator size="large" color={COLOR_VINO} />
                <Text style={{ marginTop: 8, color: COLOR_TEXTO }}>Cargando galería…</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 🟥 Encabezado vino tinto */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Galería de Fotos</Text>
            </View>

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

// 💅 Estilos vino tinto
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_FONDO
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        backgroundColor: COLOR_VINO,
        paddingVertical: 14,
        marginBottom: 6,
        shadowColor: COLOR_VINO,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    headerText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    error: {
        backgroundColor: '#F8D7DA',
        color: COLOR_VINO,
        margin: 12,
        padding: 8,
        borderRadius: 10,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: COLOR_VINO
    },
    card: {
        width: CARD_W,
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: GAP,
        shadowColor: COLOR_VINO,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    image: {
        width: '100%',
        aspectRatio: 1
    },
    meta: {
        padding: 10,
        alignItems: 'center'
    },
    author: {
        fontSize: 16,
        fontWeight: '700',
        color: COLOR_VINO
    },
    sub: {
        fontSize: 12,
        color: '#555',
        marginTop: 2
    },
});

import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Photo = {
    id: string;
    author: string;
    download_url: string;
};

// 📐 2 columnas
const GAP = 12;
const COLS = 2;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - GAP * (COLS + 1)) / COLS;

// 🎨 Paletas
const PALETTE = {
    light: {
        bg: '#F7F3F4',
        text: '#2C2C2C',
        card: '#FFFFFF',
        sub: '#555',
        wine: '#7B1E3A',
        errorBg: '#F8D7DA',
        border: '#7B1E3A',
        spinner: '#7B1E3A',
        barStyle: 'dark-content' as const,
    },
    dark: {
        bg: '#17151A',
        text: '#EDEBED',
        card: '#211E24',
        sub: '#B9B4BE',
        wine: '#C94C6A',
        errorBg: '#3A1F28',
        border: '#C94C6A',
        spinner: '#C94C6A',
        barStyle: 'light-content' as const,
    },
};

export default function Index() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [page, setPage] = useState(1);

    const theme = isDark ? PALETTE.dark : PALETTE.light;
    const styles = useMemo(() => createStyles(theme), [theme]);

    // 🔄 Merge sin duplicados por id
    const mergeUnique = (curr: Photo[], incoming: Photo[]) => {
        const map = new Map<string, Photo>();
        [...curr, ...incoming].forEach((p) => map.set(p.id, p));
        return Array.from(map.values());
    };

    // 🔄 Carga (inicial / refresco / load more)
    const fetchPhotos = async (pageToLoad = 1, append = false) => {
        try {
            setError(null);
            if (append) setLoadingMore(true);
            else if (!refreshing) setLoading(true);

            const res = await axios.get<Photo[]>(
                `https://picsum.photos/v2/list?page=${pageToLoad}&limit=30`
            );

            setPhotos((prev) => (append ? mergeUnique(prev, res.data) : res.data));
            setPage(pageToLoad);
        } catch (e) {
            setError('No se pudieron cargar las imágenes.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPhotos(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPhotos(1, false);
    }, []);

    const loadMore = () => {
        if (loadingMore) return;
        fetchPhotos(page + 1, true);
    };

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

    const Footer = () => (
        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            {loadingMore ? (
                <ActivityIndicator color={theme.spinner} />
            ) : (
                <Pressable
                    onPress={loadMore}
                    style={({ pressed }) => [
                        styles.loadMoreBtn,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                    ]}
                >
                    <Text style={styles.loadMoreText}>Cargar más</Text>
                </Pressable>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <StatusBar barStyle={theme.barStyle} />
                <ActivityIndicator size="large" color={theme.spinner} />
                <Text style={[styles.loadingText]}>Cargando galería…</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.barStyle} />

            {/* Header con toggle Día/Noche */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Galería de Fotos</Text>

                <Pressable
                    onPress={() => setIsDark((v) => !v)}
                    style={({ pressed }) => [
                        styles.toggleBtn,
                        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                    ]}
                >
                    <Text style={styles.toggleText}>{isDark ? 'Modo Día ☀️' : 'Modo Noche 🌙'}</Text>
                </Pressable>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={photos}
                keyExtractor={(it) => it.id}
                renderItem={renderItem}
                numColumns={COLS}
                columnWrapperStyle={{ gap: GAP, paddingHorizontal: GAP }}
                contentContainerStyle={{ paddingVertical: GAP }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.spinner}
                    />
                }
                ListFooterComponent={<Footer />}
            // (Opcional) Auto-cargar al llegar al final:
            // onEndReached={loadMore}
            // onEndReachedThreshold={0.5}
            />
        </SafeAreaView>
    );
}

// 🧵 estilos dependientes del tema
const createStyles = (t: typeof PALETTE.light | typeof PALETTE.dark) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: t.bg },
        center: { justifyContent: 'center', alignItems: 'center' },
        loadingText: { marginTop: 8, color: t.text },

        header: {
            backgroundColor: t.wine,
            paddingVertical: 14,
            paddingHorizontal: 12,
            marginBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: t.wine,
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
        },
        headerText: {
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        toggleBtn: {
            backgroundColor: '#FFFFFF20',
            borderWidth: 1,
            borderColor: '#FFFFFF55',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
        },
        toggleText: {
            color: '#FFF',
            fontWeight: '700',
        },

        error: {
            backgroundColor: t.errorBg,
            color: t.wine,
            margin: 12,
            padding: 8,
            borderRadius: 10,
            textAlign: 'center',
            borderWidth: 1,
            borderColor: t.border,
        },

        card: {
            width: CARD_W,
            backgroundColor: t.card,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: GAP,
            shadowColor: t.wine,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkLike(t) ? 0.3 : 0.18,
            shadowRadius: 6,
            elevation: 4,
        },
        image: { width: '100%', aspectRatio: 1 },
        meta: { padding: 10, alignItems: 'center' },
        author: { fontSize: 16, fontWeight: '700', color: t.wine },
        sub: { fontSize: 12, color: t.sub, marginTop: 2 },

        loadMoreBtn: {
            backgroundColor: t.wine,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
        },
        loadMoreText: {
            color: '#FFF',
            fontWeight: '700',
        },
    });

// util para matizar sombra
function isDarkLike(theme: typeof PALETTE.light | typeof PALETTE.dark) {
    return theme === PALETTE.dark;
}

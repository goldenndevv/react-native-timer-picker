import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ViewabilityConfigCallbackPairs,
    ViewToken,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { generateNumbers } from "../../utils/generateNumbers";
import { colorToRgba } from "../../utils/colorToRgba";
import { generateStyles } from "./DurationPicker.styles";

interface DurationScrollProps {
    numberOfItems: number;
    label?: string;
    initialIndex?: number;
    onValueChange: (value: number) => void;
    padNumbersWithZero?: boolean;
    enableInfiniteScroll?: boolean;
    pickerGradientOverlayProps?: React.ComponentProps<typeof LinearGradient>;
    styles: ReturnType<typeof generateStyles>;
}

const DurationScroll = ({
    numberOfItems,
    label,
    initialIndex = 0,
    onValueChange,
    padNumbersWithZero,
    enableInfiniteScroll = true,
    pickerGradientOverlayProps,
    styles,
}: DurationScrollProps): React.ReactElement => {
    const flatListRef = useRef<FlatList | null>(null);

    const data = generateNumbers(numberOfItems, {
        padWithZero: padNumbersWithZero,
        repeatNTimes: 3,
    });

    const renderItem = ({ item }: { item: string }) => (
        <View key={item} style={styles.pickerItemContainer}>
            <Text style={styles.pickerItem}>{item}</Text>
        </View>
    );

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (
                viewableItems[0]?.index &&
                viewableItems[0].index < numberOfItems * 0.5
            ) {
                flatListRef.current?.scrollToIndex({
                    animated: false,
                    index: viewableItems[0].index + numberOfItems,
                });
            } else if (
                viewableItems[0]?.index &&
                viewableItems[0].index >= numberOfItems * 2.5
            ) {
                flatListRef.current?.scrollToIndex({
                    animated: false,
                    index: viewableItems[0].index - numberOfItems,
                });
            }
        },
        []
    );

    const viewabilityConfigCallbackPairs =
        useRef<ViewabilityConfigCallbackPairs>([
            {
                viewabilityConfig: { viewAreaCoveragePercentThreshold: 25 },
                onViewableItemsChanged: onViewableItemsChanged,
            },
        ]);

    return (
        <View
            style={{
                height: styles.pickerItemContainer.height * 3,
                overflow: "hidden",
            }}>
            <FlatList
                ref={flatListRef}
                data={data}
                getItemLayout={(_, index) => ({
                    length: styles.pickerItemContainer.height,
                    offset: styles.pickerItemContainer.height * index,
                    index,
                })}
                initialScrollIndex={
                    (initialIndex % numberOfItems) + numberOfItems
                }
                windowSize={3}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                scrollEventThrottle={10}
                snapToAlignment="start"
                // used in place of snapToOffset due to bug on Android
                snapToOffsets={[...Array(data.length)].map(
                    (_, i) => i * styles.pickerItemContainer.height
                )}
                viewabilityConfigCallbackPairs={
                    enableInfiniteScroll
                        ? viewabilityConfigCallbackPairs?.current
                        : undefined
                }
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(
                        e.nativeEvent.contentOffset.y /
                            styles.pickerItemContainer.height
                    );
                    onValueChange((newIndex + 1) % (numberOfItems + 1));
                }}
            />
            <View style={styles.pickerLabelContainers}>
                <Text style={styles.pickerLabel}>{label}</Text>
            </View>
            <LinearGradient
                colors={[
                    styles.pickerContainer.backgroundColor ?? "white",
                    colorToRgba({
                        color:
                            styles.pickerContainer.backgroundColor ?? "white",
                        opacity: 0,
                    }),
                ]}
                start={{ x: 1, y: 0.3 }}
                end={{ x: 1, y: 1 }}
                {...pickerGradientOverlayProps}
                style={[styles.pickerGradientOverlays, { top: 0 }]}
            />
            <LinearGradient
                colors={[
                    colorToRgba({
                        color:
                            styles.pickerContainer.backgroundColor ?? "white",
                        opacity: 0,
                    }),
                    styles.pickerContainer.backgroundColor ?? "white",
                ]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 0.7 }}
                {...pickerGradientOverlayProps}
                style={[styles.pickerGradientOverlays, { bottom: 0 }]}
            />
        </View>
    );
};

export default DurationScroll;

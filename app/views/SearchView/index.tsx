import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import React, { memo } from 'react';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { shallowEqual } from 'react-redux';
import Animated from 'react-native-reanimated';

import ActivityIndicator from '../../containers/ActivityIndicator';
import RoomItem from '../../containers/RoomItem';
import { type IRoomItem } from '../../containers/RoomItem/interfaces';
import { MAX_SIDEBAR_WIDTH } from '../../lib/constants/tablet';
import { useAppSelector } from '../../lib/hooks/useAppSelector';
import { getRoomAvatar, getRoomTitle, getUidDirectMessage, isIOS, isRead, isTablet } from '../../lib/methods/helpers';
import { goRoom } from '../../lib/methods/helpers/goRoom';
import { getUserSelector } from '../../selectors/login';
import { useTheme } from '../../theme';
import { useGetItemLayout } from '../RoomsListView/hooks/useGetItemLayout';
import { useSubscriptions } from '../RoomsListView/hooks/useSubscriptions';
import styles from '../RoomsListView/styles';
import { type SearchStackParamList } from '../../stacks/types';
import BackgroundContainer from '../../containers/BackgroundContainer';
import SectionHeader from './components/SectionHeader';

const INITIAL_NUM_TO_RENDER = isTablet ? 20 : 12;

const SearchView = memo(function SearchView() {
	const { colors } = useTheme();
	const navigation = useNavigation();
	const route = useRoute<RouteProp<SearchStackParamList, 'SearchView'>>();

	const query = route.params?.query?.toLowerCase() || '';

	const username = useAppSelector(state => getUserSelector(state).username);
	const useRealName = useAppSelector(state => state.settings.UI_Use_Real_Name) as boolean;
	const showLastMessage = useAppSelector(state => state.settings.Store_Last_Message) as boolean;

	const { displayMode, showAvatar } = useAppSelector(state => state.sortPreferences, shallowEqual);
	const isMasterDetail = useAppSelector(state => state.app.isMasterDetail);
	const subscribedRoom = useAppSelector(state => state.room.subscribedRoom);

	const { width } = useSafeAreaFrame();
	const getItemLayout = useGetItemLayout();
	const { subscriptions, loading } = useSubscriptions();

	// ✅ SAME FILTER
	const data = query ? subscriptions.filter(room => getRoomTitle(room).toLowerCase().includes(query)) : subscriptions;

	const onPressItem = (item: IRoomItem) => {
		if (!navigation.isFocused()) return;
		goRoom({ item, isMasterDetail });
	};

	const renderItem = ({ item }: { item: IRoomItem }) => {
		// ✅ SAME separator logic
		if (item.separator) {
			return <SectionHeader header={item.rid} />;
		}

		// ✅ SAME id logic
		const id = item.search && item.t === 'd' ? item._id : getUidDirectMessage(item);

		const swipeEnabled = !(item?.search || item?.joinCodeRequired || item?.outside);

		return (
			<RoomItem
				item={item}
				id={id}
				username={username}
				showLastMessage={showLastMessage}
				onPress={onPressItem}
				width={isMasterDetail ? MAX_SIDEBAR_WIDTH : width}
				useRealName={useRealName}
				getRoomTitle={getRoomTitle}
				getRoomAvatar={getRoomAvatar}
				getIsRead={isRead}
				isFocused={subscribedRoom === item.rid}
				swipeEnabled={swipeEnabled}
				showAvatar={showAvatar}
				displayMode={displayMode}
			/>
		);
	};

	if (loading) {
		return <ActivityIndicator />;
	}

	// ✅ SAME empty state
	if (query && data.length === 0) {
		return <BackgroundContainer text='No rooms found' />;
	}

	return (
		<Animated.FlatList
			data={data}
			extraData={data} // ✅ important
			contentInsetAdjustmentBehavior='automatic'
			keyExtractor={item => `${item.rid}-${query}`} // ✅ same behavior
			style={[styles.list, { backgroundColor: colors.surfaceRoom }]}
			renderItem={renderItem}
			// ❗ optional: keep or remove depending on UX
			// ListHeaderComponent={ListHeader}
			getItemLayout={getItemLayout}
			removeClippedSubviews={isIOS}
			keyboardShouldPersistTaps='always'
			initialNumToRender={INITIAL_NUM_TO_RENDER}
			windowSize={9}
			onEndReachedThreshold={0.5}
			keyboardDismissMode={isIOS ? 'on-drag' : 'none'}
		/>
	);
});

export default SearchView;

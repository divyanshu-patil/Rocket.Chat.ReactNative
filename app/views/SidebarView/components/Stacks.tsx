import { memo } from 'react';

import { useTheme } from '../../../theme';
import * as List from '../../../containers/List';
import { sidebarNavigate } from '../methods/sidebarNavigate';
import { useAppSelector } from '../../../lib/hooks/useAppSelector';

const Stacks = ({ currentScreen }: { currentScreen: string | null }) => {
	'use memo';

	const { colors } = useTheme();
	const isMasterDetail = useAppSelector(state => state.app.isMasterDetail);

	if (isMasterDetail) {
		return null;
	}

	return (
		<>
			<List.Item
				title={'Rocket_Chat_Open'}
				left={() => <List.Icon name='rocket' />}
				onPress={() => sidebarNavigate('ChatsStackNavigator')}
				backgroundColor={currentScreen === 'ChatsStackNavigator' ? colors.strokeLight : undefined}
				testID='sidebar-chats'
			/>
			<List.Separator />
			<List.Item
				title={'localhost'}
				left={() => <List.Icon name='rocket' />}
				onPress={() => sidebarNavigate('ProfileStackNavigator')}
				backgroundColor={currentScreen === 'ProfileStackNavigator' ? colors.strokeLight : undefined}
				testID='sidebar-profile'
			/>
		</>
	);
};
export default memo(Stacks);

import React from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { Waypoint } from "react-waypoint";
import { useWeb3React } from "@web3-react/core";
import { useSelector, useDispatch } from "react-redux";
import { envConfig } from "@project/contracts";
import DisplayNotice from "components/DisplayNotice";

import {
  api,
  utils,
  NotificationItem,
} from "@epnsproject/frontend-sdk-staging";
import {
  addPaginatedNotifications,
  incrementPage,
  setFinishedFetching,
  updateTopNotifications,
} from "redux/slices/notificationSlice";

import { Item } from "components/SharedStyling";

const NOTIFICATIONS_PER_PAGE = 10;
// Create Header
function Feedbox() {
  const dispatch = useDispatch();
  const { account } = useWeb3React();
  const { notifications, page, finishedFetching, toggle } = useSelector(
    (state: any) => state.notifications
  );

  const [bgUpdateLoading, setBgUpdateLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentTab] = React.useState("inbox");

  const loadNotifications = async () => {
    if (loading || finishedFetching) return;
    setLoading(true);
    try {
      const { count, results } = await api.fetchNotifications(
        account,
        NOTIFICATIONS_PER_PAGE,
        page,
        envConfig.apiUrl
      );
      const parsedResponse = utils.parseApiResponse(results);
      dispatch(addPaginatedNotifications(parsedResponse));
      if (count === 0) {
        dispatch(setFinishedFetching());
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchLatestNotifications = async () => {
    if (loading || bgUpdateLoading) return;
    setBgUpdateLoading(true);
    setLoading(true);
    try {
      const { count, results } = await api.fetchNotifications(
        account,
        NOTIFICATIONS_PER_PAGE,
        1,
        envConfig.apiUrl
      );
      if (!notifications.length) {
        dispatch(incrementPage());
      }
      const parsedResponse = utils.parseApiResponse(results);
      // replace the first 20 notifications with these
      dispatch(
        updateTopNotifications({
          notifs: parsedResponse,
          pageSize: NOTIFICATIONS_PER_PAGE,
        })
      );
      if (count === 0) {
        dispatch(setFinishedFetching());
      }
    } catch (err) {
      console.log(err);
    } finally {
      setBgUpdateLoading(false);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (account && currentTab === "inbox") {
      fetchLatestNotifications();
    }
    // eslint-disable-next-line
  }, [account, currentTab]);

  React.useEffect(() => {
    fetchLatestNotifications();
    // eslint-disable-next-line
  }, [toggle]);

  //function to query more notifications
  const handlePagination = async () => {
    loadNotifications();
    dispatch(incrementPage());
  };

  const showWayPoint = (index: any) => {
    return (
      Number(index) === notifications.length - 1 &&
      !finishedFetching &&
      !bgUpdateLoading
    );
  };

  // Render
  return (
    <Container>
      {notifications && (
        <Notifs id="scrollstyle-secondary">
          {bgUpdateLoading && (
            <Item padding="10px 20px">
              <Loader type="Oval" color="#35c5f3" height={40} width={40} />
            </Item>
          )}

          {notifications.map((oneNotification, index) => {
            const { cta, title, message, app, icon, image } = oneNotification;

            // render the notification item
            return (
              <div key={`${message}+${title}`}>
                {showWayPoint(index) && (
                  <Waypoint onEnter={() => handlePagination()} />
                )}
                <NotificationItem
                  notificationTitle={title}
                  notificationBody={message}
                  cta={cta}
                  app={app}
                  icon={icon}
                  image={image}
                />
              </div>
            );
          })}

          {loading && !bgUpdateLoading && (
            <Item padding="10px 20px">
              <Loader type="Oval" color="#35c5f3" height={40} width={40} />
            </Item>
          )}
        </Notifs>
      )}
      {!notifications.length && !loading && (
        <Item>
          <DisplayNotice
            title="You currently have no notifications, try subscribing to some channels."
            theme="third"
          />
        </Item>
      )}
    </Container>
  );
}

// css styles
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  font-weight: 200;
  align-content: center;
  align-items: stretch;
  justify-content: center;
  height: inherit;
`;

const Notifs = styled.div`
  align-self: stretch;
  padding: 10px 20px;
  overflow-y: scroll;
  background: ${(props) => props.theme.mainBg};
  flex: 1;

  "-webkit-scrollbar-track": {
    background-color: #eee;
    border-radius: 10px;
  }
`;

// Export Default
export default Feedbox;

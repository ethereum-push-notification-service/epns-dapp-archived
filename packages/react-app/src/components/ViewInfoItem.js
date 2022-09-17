import React from "react";
import styled from 'styled-components';

// Other Information URLs
function ViewInfoItem() {
  // render
  return (
    <>
    <Container id="epns-browser">
      <ChannelInfo >
        <ChannelTitle>
          <>
          <AppLinkText>
            <AppLink href={`${process.env.REACT_APP_BROWSER_EXTENSION_URL}`} target="_blank" rel="nofollow">
              Download EPNS Browser Extension
            </AppLink>
          </AppLinkText>
          
          </>
        </ChannelTitle>
      </ChannelInfo>
    </Container>
    <Container id="epns-app-ios">
      <ChannelInfo >
        <ChannelTitle>
          <>
          <AppLinkText>
            <AppLink href={`${process.env.REACT_APP_IOS_STAGING_DAPP_URL}`} target="_blank" rel="nofollow">
              Download EPNS App (iOS)
            </AppLink>
          </AppLinkText>
           For iOS Users
          </>
        </ChannelTitle>
      </ChannelInfo>
    </Container>
    <Container id="epns-app">
      <ChannelInfo >
        <ChannelTitle>
          <>
          <AppLinkText>
            <AppLink href={`${process.env.REACT_APP_ANDROID_STAGING_DAPP_URL}`} target="_blank" rel="nofollow">
              Download EPNS App (Android)
            </AppLink>
          </AppLinkText>
           For Android Users
          </>
        </ChannelTitle>
      </ChannelInfo>
    </Container>
    <Container >
      <ChannelInfo>
        <ChannelTitle>
          <ChannelTitleLink href={process.env.REACT_APP_HOW_TO_GUIDE} target="_blank" rel="nofollow">
            Click here for our How to Guides
          </ChannelTitleLink>
        </ChannelTitle>
      </ChannelInfo>
    </Container>
    </>
  );
}

// css styles
const Container = styled.div`
  flex: 1;
  // display: flex;
  // flex-wrap: wrap;

  background: ${props => props.theme.mainBg};

  color:${props => props.theme.color};
  border-radius: 10px;
  border: 1px solid rgb(237, 237, 237);

  margin: 15px 0px;
  justify-content: center;
  padding: 10px;
`

const ChannelTitleLink = styled.a`
  text-decoration: none;
  font-weight: 600;
  color: #e20880;
  font-size: 20px;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
    pointer: hand;
  }
`
const AppLink = styled.a`
  text-decoration: none;
  font-weight: 600;
  color: #e20880;
  font-size: 20px;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
    pointer: hand;
  }
`
const AppLinkText = styled.div`
  text-decoration: none;
  font-weight: 600;
  color: #e20880;
  font-size: 20px;
`
const ChannelInfo = styled.div`
  flex: 1;
  margin: 5px 10px;
  min-width: 120px;
  flex-grow: 4;
  flex-direction: column;
  display: flex;
`

const ChannelTitle = styled.div`
  margin-bottom: 5px;
`

// Export Default
export default ViewInfoItem;

import React,{useEffect} from "react";
import { toast } from "react-toastify";
import Dropdown from "react-dropdown";
import { FiLink } from "react-icons/fi";
import {Oval} from "react-loader-spinner";
import styled , {useTheme} from "styled-components";
import { BsFillImageFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { postReq } from "api";
import {
Section,
Content,
Item,
ItemH,
H2,
H3,
Span,
Button,
FormSubmision,
Input,
TextField,
} from "primaries/SharedStyling";

import "react-dropdown/style.css";
import "react-toastify/dist/ReactToastify.min.css";
import Switch from "@material-ui/core/Switch";
import { useWeb3React } from "@web3-react/core";
import { CloseIcon } from "assets/icons";
import PreviewNotif from "./PreviewNotif";
import CryptoHelper from "helpers/CryptoHelper";
import { envConfig } from "@project/contracts";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import { IPFSupload } from "helpers/IpfsHelper";
import { convertAddressToAddrCaip } from "helpers/CaipHelper";

const ethers = require("ethers");

const CORE_CHAIN_ID = envConfig.coreContractChain;

export const IOSSwitch = styled(Switch).attrs(() => ({
  classes: {
    root: "root",
    switchBase: "switchBase",
    thumb: "thumb",
    track: "track",
    checked: "checked",
    focusVisible: "focusVisible"
  },
  disableRipple: true,
  focusVisibleClassName: "focusVisible"
}))`
  &.root {
    width: 42px;
    height: 20px;
    padding: 0px;
  }

  .switchBase {
    padding: 0px;
    margin: 4px;
    transition-duration: 300ms;

    &.checked {
      transform: translateX(22px);
      color: white;
      & + .track {
        background-color: #cf1c84;
        opacity: 1;
        border: none;
      }
    }

    &.focusVisible &.thumb {
      color: #52d869;
    }
  }

  .thumb {
    box-sizing: border-box;
    width: 12px;
    height: 12px;
  }

  & .track {
    border-radius: 13px;
    background-color: #a0a3b1;
    opacity: 1;
    transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
      border 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .checked {
  }
  .focusVisible {
  }
`;


// Set Notification Form Type | 0 is reserved for protocol storage
const NFTypes = [
{ value: "1", label: "Broadcast (IPFS Payload)" },
// { value: "2", label: "Old Secret (IPFS Payload)" },
{ value: "3", label: "Targeted (IPFS Payload)" },
{ value: "4", label: "Subset (IPFS Payload)" },
//   { value: "5", label: "Secret (IPFS Payload)" },
// { value: "6", label: "Offchain (Push)" },
];
const LIMITER_KEYS = ["Enter", ","];

// Create Header
function SendNotifications() {
const theme = useTheme();
const { account, library, chainId } = useWeb3React();
const { epnsCommWriteProvider, epnsCommReadProvider } = useSelector(
  (state: any) => state.contracts
);
const { channelDetails, delegatees } = useSelector(
  (state: any) => state.admin
);
const { CHANNNEL_DEACTIVATED_STATE } = useSelector(
  (state: any) => state.channels
);
const { canSend } = useSelector(
    (state:any) => {
    return state.canSend
    }
);
const onCoreNetwork = CORE_CHAIN_ID === chainId;
  
const [nfProcessing, setNFProcessing] = React.useState(0);
const [channelAddress, setChannelAddress] = React.useState("");
const [nfRecipient, setNFRecipient] = React.useState("");
const [multipleRecipients, setMultipleRecipients] = React.useState([]);
const [tempRecipeint, setTempRecipient] = React.useState(""); // to temporarily hold the address of one recipient who would be entered into the recipeints array above.
const [nfType, setNFType] = React.useState("1");
const [nfSub, setNFSub] = React.useState("");
const [nfSubEnabled, setNFSubEnabled] = React.useState(false);
const [nfMsg, setNFMsg] = React.useState("");
const [nfCTA, setNFCTA] = React.useState("");
const [nfCTAEnabled, setNFCTAEnabled] = React.useState(false);
const [nfMedia, setNFMedia] = React.useState("");
const [nfMediaEnabled, setNFMediaEnabled] = React.useState(false);
const [nfInfo, setNFInfo] = React.useState("");
const [delegateeOptions, setDelegateeOptions] = React.useState([]);

useEffect(() => {
    if (canSend !== 1) {
        const url = window.location.origin;
        window.location.replace(`${url}/#/channels`);
    }
});

const isChannelDeactivated = channelDetails
    ? channelDetails.channelState === CHANNNEL_DEACTIVATED_STATE
      : false;
  // console.log(delegatees);
  let cannotDisplayDelegatees;
  if (onCoreNetwork && delegatees)
      cannotDisplayDelegatees = (delegatees.length === 1 && delegatees[0].address === account) ||
          !delegatees.length; //do not display delegatees dropdown if you are the only delegatee to yourself or there are no delegatess
  else if(!onCoreNetwork && delegatees)
      cannotDisplayDelegatees = (delegatees.length === 1 && delegatees[0].alias_address === account) ||
          !delegatees.length;
  
// construct a list of channel delegators
React.useEffect(() => {
    if (!account) return;
    if (!delegatees || !delegatees.length) {
        setChannelAddress(account);
    } else {
        setDelegateeOptions(
            delegatees.map((oneDelegatee: any) => ({
                value: oneDelegatee.address,
                label: (
                    <CustomDropdownItem>
                        <img src={oneDelegatee.icon} alt="" />
                        <div>{oneDelegatee.name}</div>
                    </CustomDropdownItem>
                ),
            }))
        );
        // default the channel address to the first one on the list which should be that of the user if they have a channel
        setChannelAddress(delegatees[0].address);
    }
}, [delegatees, account]);
  
// const isAllFieldsFilled = () => {
//     if (nfRecipient == "" ||
//         nfType == "" ||
//         nfMsg == "" ||
//         (nfSubEnabled && nfSub == "") ||
//         (nfCTAEnabled && nfCTA == "") ||
//         (nfMediaEnabled && nfMedia == "")
//     ) {
//         return false;
//     }
//     return true;
// };

// const previewNotif = (e: any) => {
//     e.preventDefault();
//     if(isAllFieldsFilled())
//         setPreviewNotifModalOpen(true)
//     else {
//         setNFInfo("Please fill all fields to preview");
//         setTimeout(() => {
//             setNFInfo('');
//         }, 2000);
//     }
// }

// on change for the subset type notifications input
const handleSubsetInputChange = (e: any) => {
  // if the user enters in a comma or an enter then separate the addresses
  if (LIMITER_KEYS.includes(e.key)) {
      e.preventDefault();
      // if they enter a limiter key, then add the temp value to the recipeints list
      // then clear the value of the temp text
      setMultipleRecipients((oldRecipients) =>
          // use this combination to remove duplicates
          Array.from(new Set([...oldRecipients, tempRecipeint]))
      );
      const listRecipients = Array.from(
          new Set([...multipleRecipients, tempRecipeint])
      );
      setNFRecipient(listRecipients.join());
      setTempRecipient("");
  }
};
// when to remove a subscriber
const removeRecipient = (recipientAddress: any) => {
  const filteredRecipients = multipleRecipients.filter(
      (rec) => rec !== recipientAddress
  );
  setNFRecipient(filteredRecipients.join());
  setMultipleRecipients(filteredRecipients);
};

React.useEffect(() => {
  const broadcastIds = ["1"]; //id's of notifications which qualify as broadcast
  setMultipleRecipients([]); //reset array when type changes/
  if (broadcastIds.includes(nfType)) {
      // This is broadcast, nfRecipient will be the same
      setNFRecipient(account);
  } else {
      setNFRecipient("");
  }
}, [nfType]);

// validate the body being sent, return true if no errors
const bodyValidated = (notificationToast) => {
  let validated = true;
  // if we are sending for a subset and there
  if (nfType === "4" && multipleRecipients.length < 2) {
      toast.update(notificationToast, {
          render: "Please enter at least two recipients in order to use subset notifications type",
          type: toast.TYPE.ERROR,
          autoClose: 5000,
      });
      validated = false;
  }
  return validated;
};

const handleSendMessage = async (e) => {
  // Check everything in order
  e.preventDefault();

  // Toastify
  let notificationToast = toast.dark(
      <LoaderToast msg="Preparing Notification" color="#fff" />,
      {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      }
  );

  // do some validation
  if (!bodyValidated(notificationToast)) return;

  // Set to processing
  setNFProcessing(1);

  // Form signer and contract connection
//   const communicatorContract = epnsCommWriteProvider;
  // define the epns comms contracts

  // For payload basic
  let nsub = nfSub;
  let nmsg = nfMsg;
  let secretEncrypted;

  let asub = nfSub;
  let amsg = nfMsg;
  let acta = nfCTA;
  let aimg = nfMedia;

  // Decide type and storage
//   switch (nfType) {
//       // Broadcast Notification
//       case "1":
//           break;

//       // Targeted Notification
//       case "3":
//           break;

//       // Old Secret Notification
//     //   case "2":
//     //       // Create secret
//     //       let secret = CryptoHelper.makeid(14);

//     //       // Encrypt payload and change sub and nfMsg in notification
//     //       nsub = "You have a secret message!";
//     //       nmsg = "Open the app to see your secret message!";

//     //       // get public key from EPNSCoreHelper
//     //       let k = await EPNSCoreHelper.getPublicKey(
//     //           nfRecipient,
//     //           epnsCommWriteProvider
//     //       );
//     //       if (k == null) {
//     //           // No public key, can't encrypt
//     //           setNFInfo(
//     //               "Public Key Registration is required for encryption!"
//     //           );
//     //           setNFProcessing(2);

//     //           toast.update(notificationToast, {
//     //               render: "Unable to encrypt for this user, no public key registered",
//     //               type: toast.TYPE.ERROR,
//     //               autoClose: 5000,
//     //           });

//     //           return;
//     //       }

//     //       let publickey = k.toString().substring(2);
//     //       //console.log("This is public Key: " + publickey);

//     //       secretEncrypted = await CryptoHelper.encryptWithECIES(
//     //           secret,
//     //           publickey
//     //       );
//     //       asub = CryptoHelper.encryptWithAES(nfSub, secret);
//     //       amsg = CryptoHelper.encryptWithAES(nfMsg, secret);
//     //       acta = CryptoHelper.encryptWithAES(nfCTA, secret);
//     //       aimg = CryptoHelper.encryptWithAES(nfMedia, secret);
//     //       break;

//       // Targeted Notification
//       case "4":
//           break;
            
//       // Secret Notification
//       case "5":
//             // Create secret
//           let secret = CryptoHelper.makeid(8);

//           // Encrypt payload and change sub and nfMsg in notification
//           nsub = "You have a secret message!";
//           nmsg = "Click on Decrypt button to see your secret message!";

//           // get public key from Backend API
//           let encryptionKey = await postReq('/encryption_key/get_encryption_key', {
//               address: nfRecipient,
//               op: "read"
//           }).then(res => {
//               return res.data?.encryption_key;
//           });

//           if (encryptionKey == null) {
//               // No public key, can't encrypt
//               setNFInfo(
//                   "Public Key Registration is required for encryption!"
//               );
//               setNFProcessing(2);

//               toast.update(notificationToast, {
//                   render: "Unable to encrypt for this user, no public key registered",
//                   type: toast.TYPE.ERROR,
//                   autoClose: 5000,
//               });

//               return;
//           }

//           let publickey = encryptionKey;

//           secretEncrypted = await CryptoHelper.encryptWithRPCEncryptionPublicKey(
//               secret,
//               publickey
//           );
//         //   console.log(secretEncrypted);
//           if(nfSubEnabled) asub = CryptoHelper.encryptWithAES(nfSub, secret);
//           amsg = CryptoHelper.encryptWithAES(nfMsg, secret);
//           if(nfCTAEnabled) acta = CryptoHelper.encryptWithAES(nfCTA, secret);
//           if(nfMediaEnabled) aimg = CryptoHelper.encryptWithAES(nfMedia, secret);
//           break;

//       // Offchain Notification
//       case "6":
//           console.log(
//               nsub,
//               nmsg,
//               nfType,
//               asub,
//               amsg,
//               acta,
//               aimg,
//               "case 5"
//           );

//           break;
      
//       default:
//           break;
//   }

  // Handle Storage
  let storagePointer = "";

  // IPFS PAYLOAD --> 1, 2, 3
  if (
      nfType === "1" ||
      nfType === "2" ||
      nfType === "3" ||
      nfType === "4" ||
      nfType === "5"
  ) {
      // Checks for optional fields
      if (nfSubEnabled && isEmpty(nfSub)) {
          setNFInfo("Enter Subject or Disable it");
          setNFProcessing(2);

          toast.update(notificationToast, {
              render: "Incorrect Payload",
              type: toast.TYPE.ERROR,
              autoClose: 5000,
          });

          return;
      }

      if (nfMediaEnabled && isEmpty(nfMedia)) {
          setNFInfo("Enter Media URL or Disable it");
          setNFProcessing(2);

          toast.update(notificationToast, {
              render: "Incorrect Payload",
              type: toast.TYPE.ERROR,
              autoClose: 5000,
          });
          return;
      }

      if (nfCTAEnabled && isEmpty(nfCTA)) {
          setNFInfo("Enter Call to Action Link or Disable it");
          setNFProcessing(2);

          toast.update(notificationToast, {
              render: "Incorrect Payload",
              type: toast.TYPE.ERROR,
              autoClose: 5000,
          });
          return;
      }

      if (isEmpty(nfMsg)) {
          setNFInfo("Message cannot be empty");
          setNFProcessing(2);

          toast.update(notificationToast, {
              render: "Incorrect Payload",
              type: toast.TYPE.ERROR,
              autoClose: 5000,
          });
          return;
      }

    //   const jsonPayload = {
    //       notification: {
    //           title: nsub,
    //           body: nmsg,
    //       },
    //       data: {
    //           type: nfType,
    //           secret: secretEncrypted,
    //           asub: asub,
    //           amsg: amsg,
    //           acta: acta,
    //           aimg: aimg,
    //       },
    //   };

    //   // if we are sending a subset type, then include recipients
    //   if (nfType === "4") {
    //       jsonPayload["recipients"] = [...multipleRecipients];
    //   }

    //   const input = JSON.stringify(jsonPayload);
    //   console.log(input);

    //   console.log("Uploding to IPFS...");
    //   toast.update(notificationToast, {
    //       render: "Preparing Payload for upload",
    //   });

    //   const ipfs = require("nano-ipfs-store").at(
    //       "https://ipfs.infura.io:5001"
    //   );

    //   try {
    //     //   storagePointer = await ipfs.add(input);
    //       storagePointer = await IPFSupload(input);
    //   } catch (e) {
    //       setNFProcessing(2);
    //       setNFInfo("IPFS Upload Error");
    //   }

    //   console.log("IPFS cid: %o", storagePointer);
  }
  if (
      nfType === "1" ||
      nfType === "2" ||
      nfType === "3" ||
      nfType === "4" ||
      nfType === "5"
  ) {
      // Prepare Identity and send notification
    //   const identity = nfType + "+" + storagePointer;
    //   const identityBytes = ethers.utils.toUtf8Bytes(identity);
    //   console.log({
    //       identityBytes,
    //   });
    //   const EPNS_DOMAIN = {
    //       name: "EPNS COMM V1",
    //       chainId: chainId,
    //       verifyingContract: epnsCommReadProvider.address,
    //   };

    //   const type = {
    //       Data: [
    //           { name: "acta", type: "string" },
    //           { name: "aimg", type: "string" },
    //           { name: "amsg", type: "string" },
    //           { name: "asub", type: "string" },
    //           { name: "type", type: "string" },
    //           { name: "secret", type: "string" },
    //       ],
    //   };

    //   const payload = {
    //       data: {
    //           acta: acta,
    //           aimg: aimg,
    //           amsg: amsg,
    //           asub: asub,
    //           type: nfType,
    //           secret: "",
    //       },

    //       notification: {
    //           body: amsg,
    //           title: asub,
    //       },
    //   };

    //   if (nfType === "5" || nfType === "2") {
    //       payload.notification = {
    //           body: nmsg,
    //           title: nsub
    //       };
    //       payload.data.secret = secretEncrypted;
    //   }

    //   const message = payload.data;
    //   console.log(payload, "payload");
    //   console.log("chainId", chainId);
    //   const signature = await library
    //       .getSigner(account)
    //       ._signTypedData(EPNS_DOMAIN, type, message);
    //   console.log("case5 signature", signature);
      
        try {
          // apiResponse?.status === 204, if sent successfully!
            
            let notifRecipients: string | Array<string>;
            if (nfType === "4") {
                notifRecipients = multipleRecipients.map((recipient) => convertAddressToAddrCaip(recipient, chainId));
            } else {
                notifRecipients = convertAddressToAddrCaip(nfRecipient, chainId);
            }

            const channelAddressInCaip = convertAddressToAddrCaip(channelAddress, chainId);
            
            const _signer = await library.getSigner(account);
            await EpnsAPI.payloads.sendNotification({
                signer: _signer,
                type: parseInt(nfType), // target
                identityType: 2, // direct payload
                notification: {
                    title: asub,
                    body: amsg
                },
                payload: {
                    title: asub,
                    body: amsg,
                    cta: acta,
                    img: aimg
                },
                recipients: notifRecipients, // recipient address
                channel: channelAddressInCaip, // your channel address
                env: envConfig['env']
            });
        //   console.log(nfRecipient);
        //   postReq("/payloads/add_manual_payload", {
        //       signature,
        //       op: "write",
        //       chainId: chainId.toString(),
        //       channel: channelAddress,
        //       recipient: nfRecipient,
        //       deployedContract: epnsCommReadProvider.address,
        //       payload: payload,
        //       type: nfType,
        //   }).then(async (res) => {
            toast.update(notificationToast, {
                render: "Notification Sent",
                type: toast.TYPE.INFO,
                autoClose: 5000,
            });

            setNFProcessing(2);
            setNFType("1");
            setNFInfo("Offchain Notification Sent");

            toast.update(notificationToast, {
                render: "Offchain Notification Sent",
                type: toast.TYPE.SUCCESS,
                autoClose: 5000,
            });
        //       console.log(res);
        //   });
      } catch (err) {
          setNFInfo("Offchain Notification Failed, please try again");

          toast.update(notificationToast, {
              render: "Offchain Notification Failed: " + err,
              type: toast.TYPE.ERROR,
              autoClose: 5000,
          });
          setNFProcessing(0);
          console.log(err);
      }

      // var anotherSendTxPromise;

      // anotherSendTxPromise = communicatorContract.sendNotification(
      //   channelAddress,
      //   nfRecipient,
      //   identityBytes
      // );

      // console.log("Sending Transaction... ");
      // toast.update(notificationToast, {
      //   render: "Sending Notification...",
      // });

      // anotherSendTxPromise
      //   .then(async (tx) => {
      //     console.log(tx);
      //     console.log("Transaction Sent!");

      //     toast.update(notificationToast, {
      //       render: "Notification Sent",
      //       type: toast.TYPE.INFO,
      //       autoClose: 5000,
      //     });

      //     await tx.wait(1);
      //     console.log("Transaction Mined!");

      //     setNFProcessing(2);
      //     setNFType("");
      //     setNFInfo("Notification Sent");

      //     toast.update(notificationToast, {
      //       render: "Transaction Mined / Notification Sent",
      //       type: toast.TYPE.SUCCESS,
      //       autoClose: 5000,
      //     });
      //   })
      //   .catch((err) => {
      //     console.log("!!!Error handleSendMessage() --> %o", err);
      //     setNFInfo("Transaction Failed, please try again");

      //     toast.update(notificationToast, {
      //       render: "Transacion Failed: " + err,
      //       type: toast.TYPE.ERROR,
      //       autoClose: 5000,
      //     });
      //     setNFProcessing(0);
      //   });
  }
//   if (nfType === "6") {
//       // const jsonPayload = {
//       //   notification: {
//       //     title: nsub,
//       //     body: nmsg,
//       //   },
//       //   data: {
//       //     type: nfType,
//       //     secret: secretEncrypted,
//       //     asub: asub,
//       //     amsg: amsg,
//       //     acta: acta,
//       //     aimg: aimg,
//       //   },
//       // };

//       const EPNS_DOMAIN = {
//           name: "EPNS COMM V1",
//           chainId: chainId,
//           verifyingContract: epnsCommReadProvider.address,
//       };

//       const type = {
//           Data: [
//               { name: "acta", type: "string" },
//               { name: "aimg", type: "string" },
//               { name: "amsg", type: "string" },
//               { name: "asub", type: "string" },
//               { name: "type", type: "string" },
//               { name: "secret", type: "string" },
//           ],
//       };

//       const payload = {
//           data: {
//               acta: acta,
//               aimg: aimg,
//               amsg: amsg,
//               asub: asub,
//               type: nfType,
//               secret: "",
//           },

//           notification: {
//               body: amsg,
//               title: asub,
//           },
//       };

//       const message = payload.data;
//       console.log(payload, "payload");
//       console.log("chainId", chainId);
//       const signature = await library
//           .getSigner(account)
//           ._signTypedData(EPNS_DOMAIN, type, message);
//       console.log("case5 signature", signature);
//       try {
//           postReq("/payloads/add_manual_payload", {
//               signature,
//               op: "write",
//               chainId: chainId.toString(),
//               channel: channelAddress,
//               recipient: nfRecipient,
//               deployedContract: epnsCommReadProvider.address,
//               payload: payload,
//               type: "3",
//           }).then(async (res) => {
//               toast.update(notificationToast, {
//                   render: "Notification Sent",
//                   type: toast.TYPE.INFO,
//                   autoClose: 5000,
//               });

//               setNFProcessing(2);
//               setNFType("");
//               setNFInfo("Offchain Notification Sent");

//               toast.update(notificationToast, {
//                   render: "Offchain Notification Sent",
//                   type: toast.TYPE.SUCCESS,
//                   autoClose: 5000,
//               });
//               console.log(res);
//           });
//       } catch (err) {
//           if (err.code === 4001) {
//             // EIP-1193 userRejectedRequest error
//             toast.update(notificationToast, {
//                 render: "User denied message signature.",
//                 type: toast.TYPE.ERROR,
//                 autoClose: 5000,
//             });
//           } else {
//             setNFInfo("Offchain Notification Failed, please try again");

//             toast.update(notificationToast, {
//                 render: "Offchain Notification Failed: " + err,
//                 type: toast.TYPE.ERROR,
//                 autoClose: 5000,
//             });  
//           }
//           setNFProcessing(0);
//           console.log(err); 
//       }
//   }
};

const isEmpty = (field: any) => {
    if (field.trim().length == 0) {
        return true;
    }

    return false;
};

// toast customize
const LoaderToast = ({ msg, color }) => (
    <Toaster>
        <Oval color={color} height={30} width={30} />
        <ToasterMsg>{msg}</ToasterMsg>
    </Toaster>
);

let showPreview = nfSub !== '' || nfMsg !== '' || nfCTA !== '' || nfMedia !== ''

return (
    <FullBody>
    <Body>
      <Content padding="10px 20px 10px">
        <Item align="center">
          <H2 textTransform="none">
            <Span weight="400" size="32px" color={theme.color}>
              Send Notification
            </Span>
          </H2>
          <Span
            color="#657795"
            weight="400"
            size="15px"
            textTransform="none"
            spacing="0.03em"
            margin="0px 0px"
            textAlign="center"
          >
            EPNS makes it extremely easy to open and maintain a genuine
            channel of communication with your users.
          </Span>
        </Item>
      </Content>
            {/* <Content padding="10px 30px 20px">
                <Item align="flex-start">
                    <H2 textTransform="uppercase" spacing="0.1em">
                        <Span weight="200" style={{color : theme.color}}>Send </Span>
                        <Span
                            bg="#674c9f"
                            color="#fff"
                            weight="600"
                            padding="0px 8px"
                        >
                            Notification
                        </Span>
                    </H2>
                    {!isChannelDeactivated ? (
                        <H3 style={{color : theme.color}}>
                            EPNS supports three types of notifications (for
                            now!). <b>Groups</b>, <b>Subsets</b>, and{" "}<b>Targeted</b>
                        </H3>
                    ) : (
                        <H3>
                            This channel has been deactivated, please
                            reactivate it!.
                        </H3>
                    )}
                </Item>
            </Content> */}
        </Body>

        {!isChannelDeactivated && (
            <Section>
                <ModifiedContent>
                    <Item align="stretch">
                        <FormSubmision
                            flex="1"
                            direction="column"
                            margin="0px"
                            justify="center"
                            size="1.1rem"
                            onSubmit={handleSendMessage}
                        >
                            <Item
                                margin="0px 20px"
                                flex="1"
                                self="stretch"
                                align="stretch"
                            >
                                {console.log(cannotDisplayDelegatees)}
                                {!cannotDisplayDelegatees && (
                                    <Item
                                        flex="1"
                                        justify="flex-start"
                                        align="stretch"

                                    >
                                         <DropdownStyledParent>
                                        <DropdownStyled
                                            options={delegateeOptions}
                                                onChange={(option: any) => {
                                                    setChannelAddress(
                                                        option.value
                                                    );
                                                    setNFRecipient(option.value)
                                                }}
                                                placeholder="Select a Channel"
                                                value={delegateeOptions[0]}
                                                // value={delegateeOptions.find(
                                                //     (d) =>
                                                //         d.value ==
                                                //         channelAddress
                                                // )}
                                        />
                                    </DropdownStyledParent>
                                        {/* <DropdownStyledParentWhite>
                                            <DropdownHeader>
                                                SEND NOTIFICATION ON BEHALF
                                                OF
                                            </DropdownHeader>
                                            <DropdownStyledWhite
                                                options={delegateeOptions}
                                                onChange={(option: any) => {
                                                    setChannelAddress(
                                                        option.value
                                                    );
                                                }}
                                                value={delegateeOptions.find(
                                                    (d) =>
                                                        d.value ==
                                                        channelAddress
                                                )}
                                            />
                                        </DropdownStyledParentWhite> */}
                                    </Item>
                                )}

                                <Input
                                    display="none"
                                    value={nfType}
                                    onChange={(e) => {
                                        setNFType(e.target.value);
                                    }}
                                />

                                <Item
                                    flex="1"
                                    justify="flex-start"
                                    align="stretch"
                                    margin="40px 0px 0px 0px"
                                  //   minWidth="280px"
                                >
                                    <DropdownStyledParent>
                                        <DropdownStyled
                                            options={NFTypes}
                                            onChange={(option) => {
                                                setNFType(option.value);
                                                console.log(option);
                                            }}
                                            value={nfType}
                                        />
                                    </DropdownStyledParent>
                                </Item>
                                <Input
                                    display="none"
                                    value={nfType}
                                    onChange={(e) => {
                                        setNFType(e.target.value);
                                    }}
                                />

                                {nfType && (
                                    <ItemH
                                        margin="40px 0px 15px 0px"
                                        flex="1"
                                        self="stretch"
                                        justify="space-between"
                                    >
                                        <ItemH
                                            margin="15px 0px"
                                            width="10em"
                                            bg="#F4F5FA"
                                            flex="none"
                                            padding="15px"
                                            radius="20px"
                                            display="flex"
                                            direction="row"
                                            justify="space-between"
                                            
                                        >
                                            <Span
                                                weight="700"
                                                textTransform="none"
                                                size="14px"
                                                color="#1E1E1E"
                                                padding="5px 15px"
                                                radius="30px"
                                            >
                                                Subject
                                            </Span>
                                            <IOSSwitch
                                                checked={nfSubEnabled}
                                                onChange={() =>
                                                    setNFSubEnabled(
                                                        !nfSubEnabled
                                                    )
                                                }
                                            />
                                        </ItemH>

                                        <ItemH
                                            margin="15px 0px"
                                            width="10em"
                                            bg="#F4F5FA"
                                            flex="none"
                                            padding="15px"
                                            radius="20px"
                                            display="flex"
                                            direction="row"
                                            justify="space-between"
                                        >
                                            <Span
                                               weight="700"
                                               textTransform="none"
                                               size="14px"
                                               color="#1E1E1E"
                                               padding="5px 15px"
                                               radius="30px"
                                            >
                                                Media
                                            </Span>
                                            <IOSSwitch
                                                checked={nfMediaEnabled}
                                                onChange={() =>
                                                    setNFMediaEnabled(
                                                        !nfMediaEnabled
                                                    )
                                                }
                                            />
                                        </ItemH>

                                        <ItemH
                                            margin="15px 0px"
                                            width="10em"
                                            bg="#F4F5FA"
                                            flex="none"
                                            padding="15px"
                                            radius="20px"
                                            display="flex"
                                            direction="row"
                                            justify="space-between"
                                        >
                                            <Span
                                                  weight="700"
                                                  textTransform="none"
                                                  size="14px"
                                                  color="#1E1E1E"
                                                  padding="5px 15px"
                                                  radius="30px"
                                            >
                                                 CTA Link
                                            </Span>
                                            <IOSSwitch
                                                checked={nfCTAEnabled}
                                                onChange={() =>
                                                    setNFCTAEnabled(
                                                        !nfCTAEnabled
                                                    )
                                                }
                                            />
                                        </ItemH>
                                    </ItemH>
                                )}
                            </Item>

                            {(nfType === "2" ||
                                nfType === "3" ||
                                nfType === "5") && (
                                <Item
                                    margin="15px 20px 15px 20px"
                                    flex="1"
                                    self="stretch"
                                    align="stretch"
                                >
                                   <Label style={{color:theme.color}}>Recipient Wallet Address</Label>
                                    <Input
                                        required
                                        maxlength="40"
                                        flex="1"
                                        padding="12px"
                                        weight="400"
                                        size="16px"
                                        bg="white"
                                        height="25px"
                                        margin="7px 0px 0px 0px"
                                        border="1px solid #BAC4D6"
                                        focusBorder="1px solid #657795"
                                        radius="12px"
                                        value={nfRecipient}
                                        onChange={(e) => {
                                            setNFRecipient(e.target.value);
                                        }}
                                    />
                                </Item>
                            )}

                            {nfType === "4" && (
                                <>
                                    <MultiRecipientsContainer>
                                        {multipleRecipients.map(
                                            (oneRecipient) => (
                                                <span key={oneRecipient}>
                                                    {oneRecipient}
                                                    <i
                                                        onClick={() =>
                                                            removeRecipient(
                                                                oneRecipient
                                                            )
                                                        }
                                                    >
                                                        <CloseIcon />
                                                    </i>
                                                </span>
                                            )
                                        )}
                                    </MultiRecipientsContainer>
                                    <Item
                                        margin="15px 20px 15px 20px"
                                        flex="1"
                                        self="stretch"
                                        align="stretch"
                                    >
                                   <Label style={{color:theme.color}}>Enter Recipients Wallet Addresses</Label>
                                        <Input
                                            required={
                                                multipleRecipients.length ===
                                                0
                                            }
                                        maxlength="40"
                                        flex="1"
                                        padding="12px"
                                        weight="400"
                                        size="16px"
                                        bg="white"
                                        height="25px"
                                        margin="7px 0px 0px 0px"
                                        border="1px solid #BAC4D6"
                                        focusBorder="1px solid #657795"
                                        radius="12px"
                                            value={tempRecipeint}
                                            onKeyPress={
                                                handleSubsetInputChange
                                            }
                                            onChange={(e) => {
                                                const text =
                                                    e.target.value.trim();
                                                console.log(text);
                                                console.log(tempRecipeint);
                                                // if (!LIMITER_KEYS.includes(text) && text.length > 0 ) {
                                                setTempRecipient(
                                                    e.target.value
                                                );
                                                // }
                                            }}
                                        />
                                         <Span
                                              size="13px"
                                              margin="7px 0px 0px 0px"
                                              color="#657795"
                                              >
                                              Enter recipients wallet addresses separated by a comma or by pressing the enter key
                                              </Span>
                                    </Item>
                                </>
                            )}

                            {nfType && nfSubEnabled && (
                                <Item
                                    margin="15px 20px 15px 20px"
                                    flex="1"
                                    self="stretch"
                                    align="stretch"
                                >
                                   <Label style={{color:theme.color}}>Subject</Label>
                                    <Input
                                        required
                                        maxlength="40"
                                        flex="1"
                                        padding="12px"
                                        weight="400"
                                        size="16px"
                                        bg="white"
                                        height="25px"
                                        margin="7px 0px 0px 0px"
                                        border="1px solid #BAC4D6"
                                        focusBorder="1px solid #657795"
                                        radius="12px"
                                        value={nfSub}
                                        onChange={(e) => {
                                            setNFSub(e.target.value);
                                        }}
                                    />
                                </Item>
                            )}

                            {nfType && (
                                <Item
                                    margin="15px 20px 15px 20px"
                                    flex="1"
                                    self="stretch"
                                    align="stretch"
                                >
                                  <Label style={{color:theme.color}}>Notification Message</Label>
                                    <TextField
                                        required
                                        // placeholder="Your Channel's Short Description (250 Characters)"
                                        rows="4"
                                        maxlength="250"
                                        padding="12px"
                                        weight="400"
                                        margin="7px 0px 0px 0px"
                                        border="1px solid #BAC4D6"
                                        focusBorder="1px solid #657795"
                                        radius="12px"
                                        bg="#fff"
                                        overflow="auto"
                                        value={nfMsg}
                                        onChange={(e) => {
                                            setNFMsg(e.target.value);
                                        }}
                                        autocomplete="off"
                                    />
                                </Item>
                            )}

                            {nfType && nfMediaEnabled && (
                                    <Item
                                    margin="15px 20px 15px 20px"
                                    flex="1"
                                    self="stretch"
                                    align="stretch"
                                    >
                                  <Label style={{color:theme.color}}>Media URL</Label>
                                        <Input
                                              required
                                              maxlength="40"
                                              flex="1"
                                              padding="12px"
                                              weight="400"
                                              size="16px"
                                              bg="white"
                                              height="25px"
                                              margin="7px 0px 0px 0px"
                                              border="1px solid #BAC4D6"
                                              focusBorder="1px solid #657795"
                                            radius="12px"
                                            value={nfMedia}
                                            onChange={(e) => {
                                                setNFMedia(e.target.value);
                                            }}
                                        />
                                    </Item>
                            )}

                            {nfType && nfCTAEnabled && (
                                    <Item
                                    margin="15px 20px 15px 20px"
                                    flex="1"
                                    self="stretch"
                                    align="stretch"
                                    >
                                  <Label style={{color:theme.color}}>CTA Link</Label>

                                        <Input
                                          required
                                          maxlength="40"
                                          flex="1"
                                          padding="12px"
                                          weight="400"
                                          size="16px"
                                          bg="white"
                                          height="25px"
                                          margin="7px 0px 0px 0px"
                                          border="1px solid #BAC4D6"
                                          radius="12px"
                                          focusBorder="1px solid #657795"
                                            value={nfCTA}
                                            onChange={(e) => {
                                                setNFCTA(e.target.value);
                                            }}
                                        />
                                    </Item>
                            )}

                            {nfInfo && nfProcessing != 1 && (
                                <Item
                                    color="#fff"
                                    bg="#e1087f"
                                    padding="10px 15px"
                                    margin="15px 0px"
                                >
                                    <Span
                                        color="#fff"
                                        textTransform="uppercase"
                                        spacing="0.1em"
                                        weight="400"
                                        size="1em"
                                    >
                                        {nfInfo}
                                    </Span>
                                </Item>
                            )}

                              
                                  {showPreview && (<PreviewNotif
                                      details={{
                                          channelAddress: channelAddress,
                                          acta: nfCTA,
                                          aimg: nfMedia,
                                          amsg: nfMsg,
                                          asub: nfSub,
                                          type: nfType,
                                      }}
                                  />)}

                            {nfType && (
                                <Item width="15em" self="stretch" align="stretch" margin="70px auto 0px auto"
                                >
                                    <Button
                                        bg="#CF1C84"
                                        color="#fff"
                                        flex="1"
                                        radius="15px"
                                        padding="20px 10px"
                                        disabled={
                                            nfProcessing == 1 ? true : false
                                        }
                                    >
                                        {nfProcessing == 1 && (
                                            <Oval
                                                color="#fff"
                                                height={24}
                                                width={24}
                                            />
                                        )}
                                        {nfProcessing != 1 && (
                                            <Input
                                                cursor="hand"
                                                textTransform="none"
                                                color="#fff"
                                                weight="600"
                                                size="16px"
                                                type="submit"
                                                value="Send Notification"
                                            />
                                        )}
                                    </Button>
                                </Item>
                            )}
                        </FormSubmision>
                    </Item>
                </ModifiedContent>
                
            </Section>
        )}
    </FullBody>
);
}

// css styles
const Toaster = styled.div`
display: flex;
flex-direction: row;
align-items: center;
margin: 0px 10px;
`;

const FullBody = styled.div`
// background:red;
// width:50%;
`;

const ToasterMsg = styled.div`
margin: 0px 10px;
`;

const DropdownStyledParent = styled.div`
.is-open {
    // margin-bottom: 130px;
}
`;

const MultiRecipientsContainer = styled.div`
width: 100%;
padding: 0px 20px;
padding-top: 10px;
box-sizing: border-box;
display: flex;
flex-wrap: wrap;
gap: 7px 15px;
span {
    color: white;
    background: #e20880;
    padding: 6px 10px;
    border-radius: 5px;
    i {
        cursor: pointer;
        margin-left: 25px;
    }
}
`;

const ModifiedContent = styled(Content)`
padding-top: 20px;
font-weight: 400;
width: 80%;
margin: 0 auto;
`;

const DropdownHeader = styled.div`
color: ${props => props.theme.color || "#000"};
padding: 10px;
letter-spacing: 3px;
font-size: 14px;
`;

const Label = styled.div`
font-family: 'Manrope';
font-style: normal;
font-weight: 700;
font-size: 14px;
line-height: 21px;
letter-spacing: -0.011em;
color: #1E1E1E;
`;

//   const DropdownStyled = styled(Dropdown)`
//   .Dropdown-control {
//       background-color: #000;
//       color: #fff;
//       padding: 12px 52px 12px 10px;
//       border: 1px solid #000;
//       border-radius: 4px;
//   }
//   .Dropdown-placeholder {
//       text-transform: uppercase;
//       font-weight: 400;
//       letter-spacing: 0.2em;
//       font-size: 0.8em;
//   }
//   .Dropdown-arrow {
//       top: 18px;
//       bottom: 0;
//       border-color: #fff transparent transparent;
//   }
//   .Dropdown-menu {
//       border: 1px solid #000;
//       box-shadow: none;
//       background-color: #000;
//       border-radius: 0px;
//       margin-top: -2px;
//       border-bottom-right-radius: 4px;
//       border-bottom-left-radius: 4px;
//   }
//   .Dropdown-option {
//       background-color: rgb(35 35 35);
//       color: #ffffff99;
//       text-transform: uppercase;
//       letter-spacing: 0.2em;
//       font-size: 0.7em;
//       padding: 15px 20px;
//   }
//   .Dropdown-option:hover {
//       background-color: #000000;
//       color: #fff;
//   }
//   `;

const DropdownStyled = styled(Dropdown)`
.Dropdown-control {
    background-color: white;
    color: #000;
    border: 1px solid #BAC4D6;
    border-radius: 12px;
    flex:1;
    outline: none;
    height: 50px;
    display: flex;
    font-weight: 700;
    font-size: 16px;
    line-height: 150%;
    align-items: center;
    padding: 10px;
}
.Dropdown-arrow {
    top: 20px;
    bottom: 0;
    border-color: #f #000 #000;
}
.Dropdown-menu {
  border-color: #BAC4D6;
  border-radius: 12px;
    .is-selected {
    background-color: #D00775;
    color:#fff;
  }
}

.Dropdown-option {
    background-color: #fff;
    color: #000;
    font-size: 16px;
    padding: 20px 20px;

}
.Dropdown-option:hover {
    background-color: #D00775;
    color: #000;
}
`

const DropdownStyledWhite = styled(DropdownStyled)`
.Dropdown-control {
    color: #000;
    background: #fafafa;
    border: 0px;
    padding: 15px 52px 15px 10px;
}
.Dropdown-arrow {
    border-color: #000 transparent transparent;
    top: 30px;
}
.Dropdown-menu {
    border: 0px;
    background-color: #fafafa;
}
.Dropdown-option {
    background-color: #fafafa;
    color: black;
    transition: 300ms;
}
.Dropdown-option:hover {
    background-color: #e7e6e6;
}
.Dropdown-option.is-selected {
    background-color: #f1efef;
}
`;

const DropdownStyledParentWhite = styled(DropdownStyledParent)`
// margin-bottom: 20px;
border: 1px solid rgba(169, 169, 169, 0.5);
`;

const CustomDropdownItem = styled.div`
display: flex;
align-items: center;
img {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    margin-right: 10px;
}
div {
    color: black;
    font-size: 16px;
    letter-spacing: 2px;
}
`;

const Body = styled.div`
  margin: 40px auto 0px auto;
  width: 55%; 
  @media (max-width: 600px) {
    width: 100%%; 
  }
  @media (max-width: 1224px) {
    width: 75%; 
  }
`;

// Export Default
export default SendNotifications;
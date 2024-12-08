import { TransportLayerAddressType, SDTVector, SDTReasonCode } from './enums';

export type UDPPreamble = {
  preambleSize: number;
  postambleSize: number;
  packetIdentifier: string;
};

export type ACNPacket<PreambleType, PDUBlockType, PostambleType> = {
  preamble: PreambleType;
  pduBlock: PDUBlockType;
  postamble: PostambleType;
};

export type RootLayerPDU = {
  vector: number;
  header: string;
  data: SessionDataTransportPDU[] | Uint8Array;
};

export type SDTChannelParams = {
  expiry: number;
  nakOutboundFlag: number;
  nakHoldoff: number;
  nakModulus: number;
  nakMaxWait: number;
};

export type TransportLayerAddress = {
  type: TransportLayerAddressType;
  port?: number;
  address?: string;
};

export type SDTJoinData = {
  componentID: string;
  memberID: number;
  channelNumber: number;
  reciprocalChannel: number;
  totalSequenceNumber: number;
  reliableSequenceNumber: number;
  destinationAddress: TransportLayerAddress;
  channelParameters: SDTChannelParams;
  adhocExpiry: number;
};

export type SDTJoinAcceptData = {
  leaderComponentID: string;
  channelNumber: number;
  memberID: number;
  reliableSequenceNumber: number;
  reciprocalChannel: number;
};

export type SDTJoinRefuseData = {
  leaderComponentID: string;
  channelNumber: number;
  memberID: number;
  reliableSequenceNumber: number;
  refuseCode: SDTReasonCode;
};

export type SDTLeavingData = {
  leaderComponentID: string;
  channelNumber: number;
  memberID: number;
  reliableSequenceNumber: number;
  reasonCode: SDTReasonCode;
};

export type SDTWrapperData = {
  channelNumber: number;
  totalSequenceNumber: number;
  reliableSequenceNumber: number;
  oldestAvailableWrapper: number;
  firstMemberToAck: number;
  lastMemberToAck: number;
  makThreshold: number;
  sdtClientBlock?: SDTClientBlock;
};

export type SDTAckData = {
  reliableSequenceNumber: number;
};

export type SDTNakData = {
  leaderComponenetID: string;
  channelNumber: number;
  memberID: number;
  reliableSequenceNumber: number;
  firstMissedSequence: number;
  lastMissedSequence: number;
};

export type SDTConnectData = {
  protocolID: number;
};

export type SDTConnectAcceptData = SDTConnectData;
export type SDTConnectRefuseData = {
  protocolID: number;
  refuseCode: SDTReasonCode;
};

export type SDTDisconnectData = SDTConnectData;
export type SDTDisconnectingData = {
  protocolID: number;
  reasonCode: SDTReasonCode;
};

export type SDTGetSessionsData = {
  componentID: string;
};

export type SessionDataTransportPDU = {
  vector: SDTVector;
  length: number;
  // TODO(jwetzell): cleanup these types
  data:
    | SDTJoinData
    | SDTJoinAcceptData
    | SDTJoinRefuseData
    | SDTWrapperData
    | SDTAckData
    | SDTLeavingData
    | SDTGetSessionsData
    | SDTNakData
    | SDTConnectData
    | SDTConnectAcceptData
    | SDTConnectRefuseData
    | SDTDisconnectData
    | SDTDisconnectingData
    | Uint8Array;
};

export type SDTClientBlock = {
  memberID: number;
  clientProtocol: number;
  association: number;
  data: SessionDataTransportPDU | Uint8Array;
};

export enum Protocols {
  SDT = 1,
}

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
  data: SessionDataTransportPDU | Uint8Array;
};

export enum SessionDataTransportVectors {
  REL_WRAP = 1,
  UNREL_WRAP,
  CHANNEL_PARAMS,
  JOIN,
  JOIN_REFUSE,
  JOIN_ACCEPT,
  LEAVE,
  LEAVING,
  CONNECT,
  CONNECT_ACCEPT,
  CONNECT_REFUSE,
  DISCONNECT,
  DISCONNECTING,
  ACK,
  NAK,
  GET_SESSIONS,
  SESSIONS,
}

export enum TransportLayerAddressTypes {
  SDT_ADDR_NULL = 0,
  SDT_ADDR_IPV4,
  SDT_ADDR_IPV6,
}

export type SDTChannelParams = {
  expiry: number;
  nakOutboundFlag: number;
  nakHoldoff: number;
  nakModulus: number;
  nakMaxWait: number;
};

export type TransportLayerAddress = {
  type: TransportLayerAddressTypes;
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
  refuseCode: number;
};

export type SDTLeavingData = {
  leaderComponentID: string;
  channelNumber: number;
  memberID: number;
  reliableSequenceNumber: number;
  reasonCode: number;
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
  refuseCode: number;
};

export type SDTDisconnectData = SDTConnectData;
export type SDTDisconnectingData = {
  protocolID: number;
  reasonCode: number;
};

export type SDTGetSessionsData = {
  componentID: string;
};

export type SessionDataTransportPDU = {
  vector: SessionDataTransportVectors;
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

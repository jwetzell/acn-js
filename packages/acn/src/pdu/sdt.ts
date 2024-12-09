import pdu from '.';
import { Protocol, SDTVector } from '../enums';
import {
  DeviceManagementProtocolPDU,
  SDTAckData,
  SDTConnectAcceptData,
  SDTConnectData,
  SDTConnectRefuseData,
  SDTDisconnectData,
  SDTDisconnectingData,
  SDTGetSessionsData,
  SDTJoinAcceptData,
  SDTJoinData,
  SDTJoinRefuseData,
  SDTLeavingData,
  SDTNakData,
  SDTWrapperData,
  SessionDataTransportPDU,
  TransportLayerAddress,
} from '../types';
import { toHex } from '../utils';

// TODO(jwetzell): work out flag inheritance, will need previous PDU

export function decode(bytes: Uint8Array): SessionDataTransportPDU {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0) >> 4;
  const lengthFlag = ((flags >> 3) & 0x1) === 1;
  const vectorFlag = ((flags >> 2) & 0x1) === 1;

  if (!vectorFlag) {
    throw new Error('SDT PDU must have a vector');
  }

  const dataFlag = (flags & 0x1) === 1;

  if (!dataFlag) {
    // TODO(jwetzell): idk if this is true
    throw new Error('SDT PDU must have data');
  }

  const lengthH = view.getUint8(0) & 0x0f;
  let lengthOffset = 1;
  const lengthL = view.getUint8(lengthOffset);

  let length = (lengthH << 8) + lengthL;
  if (lengthFlag) {
    lengthOffset += 1;
    const lengthX = view.getUint8(lengthOffset);
    length = (lengthH << 16) + (lengthL << 8) + lengthX;
  }
  let vectorOffset = lengthOffset + 1;

  if (lengthFlag) {
    vectorOffset += 1;
  }

  const vector = view.getUint8(vectorOffset);

  const dataOffset = vectorOffset + 1;
  // NOTE(jwetzell): flags/lengthH + lengthL + lengthX + vector
  const dataLength = length - (1 + 1 + (lengthFlag ? 1 : 0) + 1);
  const data = decodeData(vector, bytes.subarray(dataOffset, dataOffset + dataLength));

  return {
    vector,
    length,
    data,
  };
}

function decodeClientBlock(bytes: Uint8Array) {
  if (bytes.byteLength === 0) {
    return undefined;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0) >> 4;
  const lengthFlag = ((flags >> 3) & 0x1) === 1;
  const vectorFlag = ((flags >> 2) & 0x1) === 1;

  if (!vectorFlag) {
    throw new Error('SDT PDU must have a vector');
  }

  const dataFlag = (flags & 0x1) === 1;

  if (!dataFlag) {
    // TODO(jwetzell): idk if this is true
    throw new Error('SDT PDU must have data');
  }

  const lengthH = view.getUint8(0) & 0x0f;
  let lengthOffset = 1;
  const lengthL = view.getUint8(lengthOffset);

  let length = (lengthH << 8) + lengthL;
  if (lengthFlag) {
    lengthOffset += 1;
    const lengthX = view.getUint8(lengthOffset);
    length = (lengthH << 16) + (lengthL << 8) + lengthX;
  }
  let vectorOffset = lengthOffset + 1;

  if (lengthFlag) {
    vectorOffset += 1;
  }

  const memberID = view.getUint16(vectorOffset);

  const headerOffset = vectorOffset + 2;
  const clientProtocol = view.getUint32(headerOffset);
  const association = view.getUint16(headerOffset + 4);

  const dataOffset = headerOffset + 6;
  // NOTE(jwetzell): flags/lengthH + lengthL + lengthX + vector + header
  const dataLength = length - (1 + 1 + (lengthFlag ? 1 : 0) + 2 + 6);
  let data: SessionDataTransportPDU | DeviceManagementProtocolPDU | Uint8Array = bytes.subarray(dataOffset, dataOffset + dataLength);

  if (clientProtocol === Protocol.SDT) {
    data = decode(data);
  } else if (clientProtocol === Protocol.DMP) {
    data = pdu.dmp.decode(data)
  } else {
    console.error(`SDT client block contains unknown protocol: ${clientProtocol}`);
  }
  return {
    memberID,
    clientProtocol,
    association,
    data,
  };
}

function decodeData(
  vector: SDTVector,
  bytes: Uint8Array
):
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
  | Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (vector) {
    case SDTVector.JOIN: {
      const destinationAddress: TransportLayerAddress = {
        type: view.getUint8(30),
      };

      // TODO(jwetzell): handle IPv6, type === 2
      if (destinationAddress.type === 1) {
        // IPv4
        destinationAddress.port = view.getUint16(31);
        destinationAddress.address = bytes.subarray(33, 37).join('.');
      }

      const adhocExpiry = view.getUint8(45);
      const joinData = {
        componentID: toHex(bytes.subarray(0, 16)),
        memberID: view.getUint16(16),
        channelNumber: view.getUint16(18),
        reciprocalChannel: view.getUint16(20),
        totalSequenceNumber: view.getUint32(22),
        reliableSequenceNumber: view.getUint32(26),
        destinationAddress,
        channelParameters: {
          expiry: view.getUint8(37),
          nakOutboundFlag: view.getUint8(38),
          nakHoldoff: view.getUint16(39),
          nakModulus: view.getUint16(41),
          nakMaxWait: view.getUint16(43),
        },
        adhocExpiry,
      };
      return joinData;
    }
    case SDTVector.JOIN_ACCEPT: {
      const joinData = {
        leaderComponentID: toHex(bytes.subarray(0, 16)),
        channelNumber: view.getUint16(16),
        memberID: view.getUint16(18),
        reliableSequenceNumber: view.getUint32(20),
        reciprocalChannel: view.getUint16(24),
      };
      return joinData;
    }
    case SDTVector.JOIN_REFUSE: {
      const joinData = {
        leaderComponentID: toHex(bytes.subarray(0, 16)),
        channelNumber: view.getUint16(16),
        memberID: view.getUint16(18),
        reliableSequenceNumber: view.getUint32(20),
        refuseCode: view.getUint8(24),
      };

      return joinData;
    }
    case SDTVector.REL_WRAP:
    case SDTVector.UNREL_WRAP: {
      const wrapperData: SDTWrapperData = {
        channelNumber: view.getUint16(0),
        totalSequenceNumber: view.getUint32(2),
        reliableSequenceNumber: view.getUint32(6),
        oldestAvailableWrapper: view.getUint32(10),
        firstMemberToAck: view.getUint16(14),
        lastMemberToAck: view.getUint16(16),
        makThreshold: view.getUint16(18),
        sdtClientBlock: decodeClientBlock(bytes.subarray(20)),
      };

      return wrapperData;
    }
    case SDTVector.ACK: {
      return {
        reliableSequenceNumber: view.getUint32(0),
      };
    }
    case SDTVector.LEAVING: {
      return {
        leaderComponentID: toHex(bytes.subarray(0, 16)),
        channelNumber: view.getUint16(16),
        memberID: view.getUint16(18),
        reliableSequenceNumber: view.getUint32(20),
        reasonCode: view.getUint8(24),
      };
    }
    case SDTVector.GET_SESSIONS: {
      return {
        componentID: toHex(bytes.subarray(0, 16)),
      };
    }
    case SDTVector.NAK: {
      return {
        leaderComponentID: toHex(bytes.subarray(0, 16)),
        channelNumber: view.getUint16(16),
        memberID: view.getUint16(18),
        reliableSequenceNumber: view.getUint32(20),
        firstMissedSequence: view.getUint32(24),
        lastMissedSequence: view.getUint32(28),
      };
    }
    case SDTVector.DISCONNECT:
    case SDTVector.CONNECT:
    case SDTVector.CONNECT_ACCEPT: {
      return {
        protocolID: view.getUint32(0),
      };
    }
    case SDTVector.CONNECT_REFUSE: {
      return {
        protocolID: view.getUint32(0),
        refuseCode: view.getUint8(4),
      };
    }
    case SDTVector.DISCONNECTING: {
      return {
        protocolID: view.getUint32(0),
        reasonCode: view.getUint8(4),
      };
    }
    default:
      console.error(`unhandled SDT vector: ${vector}`);
      return bytes;
  }
}

export default {
  decode,
};

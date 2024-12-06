import { SessionDataTransportPDU, SessionDataTransportVectors, TransportLayerAddress } from '../models';
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
  console.log('length', length);
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
  const data = bytes.subarray(dataOffset, dataOffset + dataLength);

  switch (vector) {
    case SessionDataTransportVectors.JOIN:
      const destinationAddress: TransportLayerAddress = {
        type: view.getUint8(dataOffset + 30),
      };

      // TODO(jwetzell): handle IPv6, type === 2
      if (destinationAddress.type === 1) {
        // IPv4
        destinationAddress.port = view.getUint16(dataOffset + 31);
        destinationAddress.address = bytes.subarray(dataOffset + 33, dataOffset + 37).join('.');
      }

      const adhocExpiry = view.getUint8(dataOffset + 45);
      const joinData = {
        componentID: toHex(bytes.subarray(dataOffset, dataOffset + 16)),
        memberID: view.getUint16(dataOffset + 16),
        channelNumber: view.getUint16(dataOffset + 18),
        reciprocalChannel: view.getUint16(dataOffset + 20),
        totalSequenceNumber: view.getUint32(dataOffset + 22),
        reliableSequenceNumber: view.getUint32(dataOffset + 26),
        destinationAddress,
        channelParameters: {
          expiry: view.getUint8(dataOffset + 37),
          nakOutboundFlag: view.getUint8(dataOffset + 38),
          nakHoldoff: view.getUint16(dataOffset + 39),
          nakModulus: view.getUint16(dataOffset + 41),
          nakMaxWait: view.getUint16(dataOffset + 43),
        },
        adhocExpiry,
      };
      return {
        vector,
        data: joinData,
      };

    default:
      console.error(`unhandled SDT vector: ${vector}`);
      break;
  }

  return {
    vector,
    data,
  };
}

export default {
  decode,
};

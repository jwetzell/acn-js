import pdu from '.';
import { Protocols, RootLayerPDU, SessionDataTransportPDU } from '../models';
import { toHex } from '../utils';

function decode(bytes: Uint8Array): RootLayerPDU {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0) >> 4;
  const lengthFlag = ((flags >> 3) & 0x1) === 1;
  const vectorFlag = ((flags >> 2) & 0x1) === 1;

  if (!vectorFlag) {
    throw new Error('Root Layer PDU must have a vector');
  }

  const headerFlag = ((flags >> 1) & 0x1) === 1;

  if (!headerFlag) {
    throw new Error('Root Layer PDU must have a header');
  }

  const dataFlag = (flags & 0x1) === 1;

  if (!dataFlag) {
    // TODO(jwetzell): idk know if this is true
    throw new Error('Root Layer PDU must have data');
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

  const vector = view.getUint32(vectorOffset);
  const headerOffset = vectorOffset + 4;

  const header = toHex(bytes.subarray(headerOffset, headerOffset + 16));

  const dataOffset = headerOffset + 16;
  // NOTE(jwetzell): flags/lengthH + lengthL + lengthX + vector + header
  const dataLength = length - (1 + 1 + (lengthFlag ? 1 : 0) + 4 + 16);
  let data: SessionDataTransportPDU | Uint8Array = bytes.subarray(dataOffset, dataOffset + dataLength);

  if (vector === Protocols.SDT) {
    data = pdu.sdt.decode(data);
  }

  return {
    vector,
    header,
    data,
  };
}

export default {
  decode,
};

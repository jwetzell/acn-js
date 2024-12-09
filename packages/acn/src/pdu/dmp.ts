import { DMPVector } from '../enums';
import { DeviceManagementProtocolPDU, DMPAddressDataType, DMPGetPropertyData } from '../types';

export function decode(bytes: Uint8Array): DeviceManagementProtocolPDU {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0) >> 4;
  const lengthFlag = ((flags >> 3) & 0x1) === 1;
  const vectorFlag = ((flags >> 2) & 0x1) === 1;
  const headerFlag = ((flags >> 1) & 0x1) === 1;

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

  let headerOffset = (vectorOffset += 1);

  const addressAndDataTypes = view.getUint8(headerOffset);
  const addressType = (addressAndDataTypes >> 6) & 0x1;
  const dataType = (addressAndDataTypes >> 4) & 0x3;
  const elementSize = addressAndDataTypes & 0x11;

  const addressAndDataType = {
    addressType,
    dataType,
    elementSize
  }
 
  const dataOffset = headerOffset + 1;
  // NOTE(jwetzell): flags/lengthH + lengthL + lengthX + vector + header
  const dataLength = length - (1 + 1 + (lengthFlag ? 1 : 0) + 1 + 1);
  const data = decodeData(vector, bytes.subarray(dataOffset, dataOffset + dataLength), addressAndDataType);
  console.log('decoded Data', data)
  return {
    vector,
    data
  };
}

function decodeData(vector: number, bytes: Uint8Array, addressAndDataType: DMPAddressDataType): DMPGetPropertyData | Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  console.log('pdu bytes', bytes)
  console.log('pdu address data type', addressAndDataType)
  switch (vector) {
    default:
      console.error(`unhandled DMP vector: ${vector}`);
      return bytes;
  }
}

export default {
  decode,
};

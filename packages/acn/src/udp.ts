import { ACNPacket, RootLayerPDU, UDPPreamble } from './types';
import pdu from './pdu';

// ANSI E1.17 - 2015 (R2020) EPI 17
export function decode(bytes: Uint8Array): ACNPacket<UDPPreamble, RootLayerPDU, undefined> {
  if (bytes.byteLength < 16) {
    throw new Error('ACN UDP packet must be at least 16 bytes long');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const preambleSize = view.getUint16(0, false);
  if (preambleSize != 16) {
    throw new Error('ACN UDP preamble size should 16');
  }
  const postambleSize = view.getUint16(2, false);
  if (postambleSize > 0) {
    throw new Error('ACN UDP postamble size should be 0');
  }

  const packetIdentifier = new TextDecoder().decode(bytes.subarray(4, preambleSize));

  if (packetIdentifier !== 'ASC-E1.17\0\0\0') {
    throw new Error('ACN Packet Identifier is incorrect');
  }

  const pduBlock = pdu.rlp.decode(bytes.subarray(preambleSize));

  return {
    preamble: {
      preambleSize,
      postambleSize,
      packetIdentifier,
    },
    pduBlock,
    postamble: undefined,
  };
}

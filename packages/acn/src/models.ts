export type Protocols = {
  SDT: 1;
};

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
  header: Uint8Array;
  data: Uint8Array;
};

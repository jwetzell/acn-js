const { deepEqual, throws } = require('assert');
const { describe, it } = require('node:test');
const acn = require('../dist/index');

const goodTests = [
  {
    description: 'simple udp pdu join',
    bytes: new Uint8Array([
      0, 16, 0, 0, 65, 83, 67, 45, 69, 49, 46, 49, 55, 0, 0, 0, 0x70, 72, 0, 0, 0, 1, 176, 171, 216, 42, 32, 210, 66,
      64, 167, 205, 62, 73, 217, 153, 164, 229, 112, 50, 4, 73, 136, 131, 52, 255, 255, 74, 69, 176, 66, 102, 183, 33,
      235, 216, 155, 0, 1, 244, 136, 0, 0, 0, 0, 244, 136, 0, 0, 244, 136, 1, 67, 216, 239, 192, 220, 207, 5, 0, 0, 2,
      0, 10, 0, 20, 1, 44,
    ]),
    expected: {
      preamble: {
        preambleSize: 16,
        postambleSize: 0,
        packetIdentifier: 'ASC-E1.17\0\0\0',
      },
      pduBlock: {
        vector: 1,
        header: 'b0abd82a20d24240a7cd3e49d999a4e5',
        data: new Uint8Array([
          112, 50, 4, 73, 136, 131, 52, 255, 255, 74, 69, 176, 66, 102, 183, 33, 235, 216, 155, 0, 1, 244, 136, 0, 0, 0,
          0, 244, 136, 0, 0, 244, 136, 1, 67, 216, 239, 192, 220, 207, 5, 0, 0, 2, 0, 10, 0, 20, 1, 44,
        ]),
      },
      postamble: undefined,
    },
  },
];

const badTests = [
  {
    description: 'bad UDP packet size',
    bytes: new Uint8Array([0, 16]),
    throwsMessage: { name: /^Error$/, message: /ACN UDP packet must be at least 16 bytes long/ },
  },
  {
    description: 'bad UDP preamble size',
    bytes: new Uint8Array([
      0, 20, 0, 0, 65, 83, 67, 45, 69, 49, 46, 49, 55, 0, 0, 0, 112, 72, 0, 0, 0, 1, 176, 171, 216, 42, 32, 210, 66, 64,
      167, 205, 62, 73, 217, 153, 164, 229, 112, 50, 4, 73, 136, 131, 52, 255, 255, 74, 69, 176, 66, 102, 183, 33, 235,
      216, 155, 0, 1, 244, 136, 0, 0, 0, 0, 244, 136, 0, 0, 244, 136, 1, 67, 216, 239, 192, 220, 207, 5, 0, 0, 2, 0, 10,
      0, 20, 1, 44,
    ]),
    throwsMessage: { name: /^Error$/, message: /ACN UDP preamble size should 16/ },
  },
  {
    description: 'bad UDP postamble size',
    bytes: new Uint8Array([
      0, 16, 0, 2, 65, 83, 67, 45, 69, 49, 46, 49, 55, 0, 0, 0, 112, 72, 0, 0, 0, 1, 176, 171, 216, 42, 32, 210, 66, 64,
      167, 205, 62, 73, 217, 153, 164, 229, 112, 50, 4, 73, 136, 131, 52, 255, 255, 74, 69, 176, 66, 102, 183, 33, 235,
      216, 155, 0, 1, 244, 136, 0, 0, 0, 0, 244, 136, 0, 0, 244, 136, 1, 67, 216, 239, 192, 220, 207, 5, 0, 0, 2, 0, 10,
      0, 20, 1, 44,
    ]),
    throwsMessage: { name: /^Error$/, message: /ACN UDP postamble size should be 0/ },
  },
  {
    description: 'bad ACN Packet Identifier',
    bytes: new Uint8Array([
      0, 16, 0, 0, 63, 83, 67, 45, 69, 49, 46, 49, 55, 0, 0, 0, 112, 72, 0, 0, 0, 1, 176, 171, 216, 42, 32, 210, 66, 64,
      167, 205, 62, 73, 217, 153, 164, 229, 112, 50, 4, 73, 136, 131, 52, 255, 255, 74, 69, 176, 66, 102, 183, 33, 235,
      216, 155, 0, 1, 244, 136, 0, 0, 0, 0, 244, 136, 0, 0, 244, 136, 1, 67, 216, 239, 192, 220, 207, 5, 0, 0, 2, 0, 10,
      0, 20, 1, 44,
    ]),
    throwsMessage: { name: /^Error$/, message: /ACN Packet Identifier is incorrect/ },
  },
];

describe('ACN Message Decoding Pass', () => {
  goodTests.forEach((messageTest) => {
    it(messageTest.description, () => {
      const decoded = acn.decode(messageTest.bytes);
      deepEqual(decoded, messageTest.expected);
    });
  });
});

describe('ACN Message Decoding Throws', () => {
  badTests.forEach((messageTest) => {
    it(messageTest.description, () => {
      throws(() => {
        acn.decode(messageTest.bytes);
      }, messageTest.throwsMessage);
    });
  });
});

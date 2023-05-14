# mKCP Protocol

mKCP is a stream transfer protocol, modified from the [KCP protocol](https://github.com/skywind3000/kcp), which can transmit any data stream in order.

## Version

mKCP has no version number and does not guarantee compatibility between versions.

## Dependencies

### Underlying Protocol

mKCP is a protocol based on UDP, and all communication uses UDP transmission.

### Functions

- fnv: [FNV-1a](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) hash function
  - Takes a string of arbitrary length as input parameter;
  - Outputs a 32-bit unsigned integer.

## Communication Process

1. mKCP splits data streams into several data packets for transmission. Each data stream has a unique identifier to distinguish it from other data streams. Each data packet in the data stream carries the same identifier.
2. mKCP does not have a handshake process. When receiving a data packet, it determines whether it is a new call or an ongoing call based on the identifier of the data stream it carries.
3. Each data packet contains several segments (Segment), which are divided into three types: data (Data), acknowledgment (ACK), and heartbeat (Ping). Each segment needs to be processed separately.

## Data Format

### Data Packet

| 4 Bytes | 2 Bytes    | L Bytes  |
| ------- | ---------- | -------- |
| Auth A  | Data Len L | Fragment |

as which:

- Authentication information A = fnv(fragment), big endian;
- The fragment may contain multiple sections.

### Data snippet

| 2 bytes   | 1 byte   | 1 byte   | 4 bytes   | 4 bytes  | 4 bytes        | 2 bytes  | Len bytes |
| --------- | -------- | -------- | --------- | -------- | -------------- | -------- | --------- |
| Conv flag | Cmd flag | Opt flag | Timestamp | Sequence | Unacknowledged | Len flag | Data      |

as which:

- Identifier Conv: Identifier for mKCP data stream
- Command Cmd: Constant 0x01
- Option Opt: Optional values include:
  - 0x00: Empty option
  - 0x01: Opposite party has sent all data
- Timestamp Ts: Time when the current segment was sent from the remote end, big endian
- Sequence Number Sn: The position of the data segment in the data stream, the sequence number of the starting segment is 0, and each new segment is sequentially added by 1
- Unacknowledged Sequence Number Una: The minimum Sn that the remote host is sending and has not yet received confirmation.

### Confirmation snippet

| 2 bytes | 1 byte | 1 byte | 4 bytes | 4 bytes         | 4 bytes   | 2 bytes | Len \* 4 bytes      |
| ------- | ------ | ------ | ------- | --------------- | --------- | ------- | ------------------- |
| Conv ID | Cmd    | Opt    | Wnd     | Next Seq Number | Timestamp | Length  | Received Seq Number |

as which:

- Identifier Conv: Identifier of the mKCP data stream
- Command Cmd: Constant 0x00
- Option Opt: Same as above
- Window Wnd: The maximum sequence number that the remote host can receive
- Next receive sequence number Sn: The smallest sequence number of the data segment that the remote host has not received
- Timestamp Ts: The timestamp of the latest received data segment by the remote host, which can be used to calculate the delay
- Received sequence numbers: Each 4 bytes, indicating that the data of this sequence number has been confirmed received.

as which:

- The remote host expects to receive data within the serial number [Sn, Wnd) range.

### Heartbeat Fragments

| 2 Bytes | 1 Byte | 1 Byte | 4 Bytes               | 4 Bytes             | 4 Bytes |
| ------- | ------ | ------ | --------------------- | ------------------- | ------- |
| Conv ID | Cmd    | Opt    | Unacknowledged Seq No | Next Receive Seq No | Rto     |

as which:

- Identifier Conv: Identifier for the mKCP data stream
- Command Cmd: Optional values include:
  - 0x02: Remote host forcibly terminates the session
  - 0x03: Normal heartbeat
- Option Opt: Same as above
- Unacknowledged sequence number Una: Same as the Una of the data fragment
- Next receive sequence number Sn: Same as the Sn of the acknowledgement fragment
- Delay Rto: Delay calculated by the remote host itself

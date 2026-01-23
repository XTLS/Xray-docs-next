# mKCP Protocol

mKCP is a stream transport protocol, modified from the [KCP Protocol](https://github.com/skywind3000/kcp), capable of transmitting arbitrary data streams in order.

## Version

mKCP has no version number and does not guarantee compatibility between versions.

## Dependencies

### Underlying Protocol

mKCP is a UDP-based protocol; all communication is transmitted using UDP.

### Functions

- fnv: [FNV-1a](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) hash function
  - Input parameter is a string of arbitrary length;
  - Outputs a 32-bit unsigned integer;

## Communication Process

1. mKCP splits the data stream into several packets for transmission. A data stream has a unique identifier to distinguish different data streams. Every packet in a data stream carries the same identifier.
2. mKCP has no handshake process. When a packet is received, the identifier carried by it determines whether it is a new call or an ongoing one.
3. Each packet contains several segments. Segments are divided into three categories: Data, ACK (Acknowledgment), and Ping (Heartbeat). Each segment needs to be processed separately.

## Data Format

### Packet

| 4 Bytes | 2 Bytes | L Bytes |
| :--- | :--- | :--- |
| Authentication A | Data Length L | Segment Part |

Where:

- Authentication A = fnv(Segment Part), big endian;
- The Segment Part may contain multiple segments;

### Data Segment

| 2 Bytes | 1 Byte | 1 Byte | 4 Bytes | 4 Bytes | 4 Bytes | 2 Bytes | Len Bytes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Identifier Conv | Command Cmd | Option Opt | Timestamp Ts | Sequence Sn | Unacknowledged Una | Length Len | Data |

Where:

- Identifier Conv: The identifier of the mKCP data stream.
- Command Cmd: Constant `0x01`.
- Option Opt: Optional values are:
  - `0x00`: Empty option.
  - `0x01`: The peer has sent all data.
- Timestamp Ts: The time when the current segment was sent from the remote end, big endian.
- Sequence Sn: The position of this data segment in the data stream. The sequence number of the starting segment is 0, and each subsequent new segment increases by 1 in order.
- Unacknowledged Una: The smallest Sn that the remote host is sending and has not yet received an acknowledgment for.

### ACK Segment

| 2 Bytes | 1 Byte | 1 Byte | 4 Bytes | 4 Bytes | 4 Bytes | 2 Bytes | Len * 4 Bytes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Identifier Conv | Command Cmd | Option Opt | Window Wnd | Next Receive Sn | Timestamp Ts | Length Len | Received Sns |

Where:

- Identifier Conv: The identifier of the mKCP data stream.
- Command Cmd: Constant `0x00`.
- Option Opt: Same as above.
- Window Wnd: The maximum sequence number the remote host can receive.
- Next Receive Sn: The smallest sequence number among the data segments not yet received by the remote host.
- Timestamp Ts: The timestamp of the latest data segment received by the remote host, used for calculating latency.
- Received Sns: Each is 4 bytes, indicating that data with this sequence number has been confirmed as received.

Note:

- The remote host expects to receive data within the sequence number range [Sn, Wnd).

### Ping (Heartbeat) Segment

| 2 Bytes | 1 Byte | 1 Byte | 4 Bytes | 4 Bytes | 4 Bytes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Identifier Conv | Command Cmd | Option Opt | Unacknowledged Una | Next Receive Sn | Latency Rto |

Where:

- Identifier Conv: The identifier of the mKCP data stream.
- Command Cmd: Optional values are:
  - `0x02`: Remote host forcibly terminates the session.
  - `0x03`: Normal heartbeat.
- Option Opt: Same as above.
- Unacknowledged Una: Same as Una in the Data Segment.
- Next Receive Sn: Same as Sn in the ACK Segment.
- Latency Rto: The latency calculated by the remote host itself.

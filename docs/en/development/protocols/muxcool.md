# Mux.Cool Protocol

Mux.Cool protocol is a multiplexing transport protocol that is used to transmit multiple independent data streams within an established data stream.

## Version

The current version is 1 Beta.

## Dependencies

### Underlying Protocol

Mux.Cool must run on top of a reliable established data stream.

## Communication Process

Within a Mux.Cool connection, multiple sub-connections can be transmitted, each with a unique ID and status. The transmission process consists of frames, with each frame used to transmit data for a specific sub-connection.

### Client behavior

When there is a need for a connection and there are no existing available connections, the client initiates a new connection to the server, referred to as the "main connection".

1. One main connection can be used to send several sub-connections. The client can decide independently how many sub-connections the main connection can handle.
2. For a new sub-connection, the client must send the `New` status to notify the server to establish the sub-connection, and then use the `Keep` status to transmit data.
3. When the sub-connection ends, the client sends the `End` status to notify the server to close the sub-connection.
4. The client can decide when to close the main connection, but must ensure that the server also maintains the connection.
5. The client can use the KeepAlive status to prevent the server from closing the main connection.

### Server-side behavior

When a new sub-connection is received on the server side, the server should handle it as a normal connection.

1. When the status "End" is received, the server can close the upstream connection to the target address.
2. The same ID used in the request must be used to transfer sub-connection data in the server response.
3. The server cannot use the "New" status.
4. The server can use the KeepAlive status to avoid the client closing the main connection.

## Data Format

Mux.Cool uses symmetric transmission format, where the client and server send and receive data in the same format.

### Frame Format

| 2 Bytes           | L Bytes  | X Bytes         |
| ----------------- | -------- | --------------- |
| Metadata Length L | Metadata | Additional Data |

### Metadata

There are several types of metadata. All types of metadata contain two items, ID and Opt, with the following meanings:

- ID: Unique identifier of the sub-connection
  - For general MUX sub-connections, the ID is accumulated starting from 1
  - For XUDP, the ID is always 0
- Opt:
  - D(0x01): Additional data is available

When option Opt(D) is enabled, the additional data format is as follows:

| 2 Bytes    | X-2 Bytes |
| ---------- | --------- |
| Length X-2 | Data      |

### New Sublink (New)

| 2 Bytes | 1 Byte | 1 Byte | 1 Byte    | 2 Bytes | 1 Byte | A Bytes |
| ------- | ------ | ------ | --------- | ------- | ------ | ------- |
| ID      | 0x01   | Option | Network N | Port    | Type T | Address |

where:

- Network type N:
  - 0x01: TCP, indicating that the traffic of the current sub-connection should be sent to the destination in the way of TCP.
  - 0x02: UDP, indicating that the traffic of the current sub-connection should be sent to the destination in the way of UDP.
- Address type T:
  - 0x01: IPv4
  - 0x02: Domain name
  - 0x03: IPv6
- Address A:
  - When T = 0x01, A is a 4-byte IPv4 address;
  - When T = 0x02, A is a 1-byte length (L) + L-byte domain name;
  - When T = 0x03, A is a 16-byte IPv6 address;

If Opt(D) is enabled when creating a sub-connection, the data carried by this frame needs to be sent to the target host.

### Keep sub-connections

| 2 Bytes | 1 Byte | 1 Byte |
| ------- | ------ | ------ |
| ID      | 0x02   | Option |

If Opt(D) is enabled while maintaining sub-connections, the data carried by this frame needs to be sent to the target host. XUDP adds the UDP address after Opt(D), and the format is the same as creating a new sub-connection.

### End

| 2 Bytes | 1 Byte | 1 Byte |
| ------- | ------ | ------ |
| ID      | 0x03   | Option |

If Opt(D) is enabled while maintaining sub-connections, the data carried by this frame needs to be sent to the target host.

### KeepAlive

| 2 Bytes | 1 Byte | 1 Byte     |
| ------- | ------ | ---------- |
| ID      | 0x04   | Option Opt |

While staying connected:

- If Opt(D) is enabled, the data carried by this frame must be discarded.
- ID can be a random value.

## Application

The Mux.Cool protocol is agnostic to the underlying protocol and can theoretically use any reliable streaming connection to transmit Mux.Cool protocol data.

In target-oriented protocols such as Shadowsocks and VMess, a specified address must be included when establishing a connection. To maintain compatibility, the Mux.Cool protocol specifies the address as "v1.mux.cool". When the target address of the main connection matches this address, the Mux.Cool forwarding method is used. Otherwise, forwarding is done in the traditional way. (Note: This is an internal tag in the program, and VMess and VLESS do not send the "v1.mux.cool" address in data packets.)

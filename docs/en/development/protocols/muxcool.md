# Mux.Cool Protocol

The Mux.Cool protocol is a multiplexing transport protocol used to transmit multiple independent data streams within a single established data stream.

## Version

The current version is 1 Beta.

## Dependencies

### Underlying Protocol

Mux.Cool must run on top of an established reliable data stream.

## Communication Process

A Mux.Cool connection can transmit multiple sub-connections. Each sub-connection has a unique ID and status. The transmission process consists of Frames, and each frame is used to transmit data for a specific sub-connection.

### Client Behavior

When there is a need for a connection and no existing connection is available, the client initiates a new connection to the server, hereafter referred to as the "main connection".

1.  A main connection can be used to send multiple sub-connections. The client can decide the number of sub-connections the main connection can carry.
2.  For a new sub-connection, the client must send the status `New` to notify the server to establish the sub-connection, and then use the status `Keep` to transmit data.
3.  When a sub-connection ends, the client sends the `End` status to notify the server to close the sub-connection.
4.  The client can decide when to close the main connection but must ensure the server also maintains the connection.
5.  The client can use the `KeepAlive` status to prevent the server from closing the main connection.

### Server Behavior

When the server receives a new sub-connection, it should handle it as a normal connection.

1.  When receiving the `End` status, the server can close the uplink connection to the target address.
2.  In the server's response, the same ID as the request must be used to transmit the sub-connection's data.
3.  The server cannot use the `New` status.
4.  The server can use the `KeepAlive` status to prevent the client from closing the main connection.

## Transmission Format

Mux.Cool uses a symmetric transmission format, meaning the client and server send and receive data in the same format.

### Frame Format

| 2 bytes | L bytes | X bytes |
| :--- | :--- | :--- |
| Metadata Length L | Metadata | Extra Data |

### Metadata

There are several types of metadata. All types of metadata include ID and Opt items, with meanings as follows:

* ID: Unique identifier for the sub-connection
    * For general Mux sub-connections, the ID accumulates starting from 1.
    * For [Single XUDP](https://github.com/XTLS/Xray-core/blob/main/common/xudp/xudp.go) implemented by Xray, the ID is always 0.
* Opt:
    * D(0x01): Has extra data

When option Opt(D) is enabled, the extra data format is as follows:

| 2 bytes | X-2 bytes |
| :--- | :--- |
| Length X-2 | Data |

### New Sub-connection (New)

| 2 bytes | 1 byte | 1 byte | 1 byte | 2 bytes | 1 byte | A bytes | 8 bytes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ID | 0x01 | Option Opt | Network Type N | Port | Address Type T | Address A | Global ID (XUDP) |

Where:

* Network Type N:
    * 0x01: TCP, indicating that the traffic of the current sub-connection should be sent to the target via TCP.
    * 0x02: UDP, indicating that the traffic of the current sub-connection should be sent to the target via UDP.
* Address Type T:
    * 0x01: IPv4
    * 0x02: Domain name
    * 0x03: IPv6
* Address A:
    * When T = 0x01, A is a 4-byte IPv4 address;
    * When T = 0x02, A is a 1-byte length (L) + L bytes of domain name;
    * When T = 0x03, A is a 16-byte IPv6 address;
* Global ID (XUDP):
    * The client calculates a global unique ID for the UDP source 2-tuple. The server uses this to ensure that when XUDP reconnects after disconnection, it still uses the same port to communicate with the target.

When creating a new sub-connection, if Opt(D) is enabled, the data carried in this frame needs to be sent to the target host.

### Keep Sub-connection (Keep)

TCP

| 2 bytes | 1 byte | 1 byte |
| :--- | :--- | :--- |
| ID | 0x02 | Option Opt |

UDP

| 2 bytes | 1 byte | 1 byte | 1 byte | 2 bytes | 1 byte | A bytes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ID | 0x02 | Option Opt | Network Type N | Port | Address Type T | Address A |

When keeping a sub-connection, if Opt(D) is enabled, the data carried in this frame needs to be sent to the target host.
XUDP adds the UDP address after Opt(D), formatted the same as in "New Sub-connection", but without the Global ID.

### End Sub-connection (End)

| 2 bytes | 1 byte | 1 byte |
| :--- | :--- | :--- |
| ID | 0x03 | Option Opt |

When closing a sub-connection, if Opt(D) is enabled, the data carried in this frame needs to be sent to the target host.

### Keep Connection (KeepAlive)

| 2 bytes | 1 byte | 1 byte |
| :--- | :--- | :--- |
| ID | 0x04 | Option Opt |

When keeping the connection:

* If Opt(D) is enabled, the data carried in this frame must be discarded.
* The ID can be a random value.

## Application

The Mux.Cool protocol is independent of the underlying protocol. Theoretically, any reliable stream connection can be used to transmit Mux.Cool protocol data.

In target-oriented protocols like Shadowsocks and VMess, a specified address must be included when the connection is established.
To maintain compatibility, the Mux.Cool protocol specifies the address as "v1.mux.cool". That is, when the target address of the main connection matches this, Mux.Cool forwarding is performed; otherwise, forwarding is performed in the traditional way. (Note: This is an internal marker within the program; VMess and VLESS do not send the "v1.mux.cool" address in the data packet.)

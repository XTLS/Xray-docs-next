# VMess Protocol

VMess is an encrypted transport protocol that can act as a bridge between Xray clients and servers.

## Version

The current version number is 1.

## Dependencies

### Underlying Protocol

VMess is a TCP-based protocol; all data is transmitted using TCP.

### User ID

The ID is equivalent to a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). It is a 16-byte random number that acts as a token.
An ID looks like: `de305d54-75b4-431b-adb2-eb6b9e546014`. It is almost completely random and can be generated using any UUID generator, such as [this one](https://www.uuidgenerator.net/).

The User ID can be specified in the [configuration file](../../config/).

### Functions

- MD5: [MD5 Function](https://en.wikipedia.org/wiki/MD5)
  - Input parameter: Byte array of arbitrary length
  - Output: A 16-byte array
- HMAC: [HMAC Function](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code)
  - Input parameters:
    - H: Hash function
    - K: Key, byte array of arbitrary length
    - M: Message, byte array of arbitrary length
- Shake: [SHA3-Shake128 Function](https://en.wikipedia.org/wiki/SHA-3)
  - Input parameter: String of arbitrary length
  - Output: String of arbitrary length

## Communication Process

VMess is a stateless protocol, meaning no handshake is required between the client and server to transmit data. Each data transmission has no effect on previous or subsequent transmissions.

The VMess client initiates a request. The server determines if the request comes from a legitimate client. If verification passes, the request is forwarded, and the received response is sent back to the client.

VMess uses an asymmetric format, meaning the request sent by the client and the response from the server use different formats.

## Client Request

| 16 bytes           | X bytes        | Remaining part |
| ------------------ | -------------- | -------------- |
| Authentication Info| Command Section| Data Section   |

### Authentication Info

The authentication info is a 16-byte hash value, calculated as follows:

- H = MD5
- K = User ID (16 bytes)
- M = UTC time, precise to seconds, a random value within 30 seconds before or after the current time (8 bytes, Big Endian)
- Hash = HMAC(H, K, M)

### Command Section

The command section is encrypted using AES-128-CFB:

- Key: MD5(User ID + []byte('c48619fe-8f02-49e0-b9e9-edf763e17e21'))
- IV: MD5(X + X + X + X), where X = []byte(Time used for generating authentication info) (8 bytes, Big Endian)

| 1 byte | 16 bytes | 16 bytes | 1 byte | 1 byte | 4 bits | 4 bits | 1 byte | 1 byte | 2 bytes | 1 byte | N bytes | P bytes | 4 bytes |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Version Ver | Data Encryption IV | Data Encryption Key | Response Auth V | Option Opt | Margin P | Encryption Sec | Reserved | Command Cmd | Port | Address Type T | Address A | Random Value | Checksum F |

Option Opt details: (When a bit is 1, the option is enabled)

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| X | X | X | X | X | M | R | S |

Where:

- **Version Ver**: Always 1.
- **Data Encryption IV**: Random value.
- **Data Encryption Key**: Random value.
- **Response Auth V**: Random value.
- **Option Opt**:
  - S (0x01): Standard format data stream (Recommended enabled).
  - R (0x02): Client expects to reuse TCP connection (Deprecated in Xray 2.23+).
    - Valid only when S is enabled.
  - M (0x04): Enable metadata obfuscation (Recommended enabled).
    - Valid only when S is enabled.
    - When enabled, both client and server need to construct two Shake instances respectively: RequestMask = Shake(Request Data IV), ResponseMask = Shake(Response Data IV).
  - X: Reserved.
- **Margin P**: Adds P bytes of random value before the checksum.
- **Encryption Sec**: Specifies the encryption method for the data section. Options:
  - 0x00: AES-128-CFB
  - 0x01: No encryption
  - 0x02: AES-128-GCM
  - 0x03: ChaCha20-Poly1305
- **Command Cmd**:
  - 0x01: TCP data
  - 0x02: UDP data
- **Port**: Integer port number in Big Endian format.
- **Address Type T**:
  - 0x01: IPv4
  - 0x02: Domain name
  - 0x03: IPv6
- **Address A**:
  - When T = 0x01, A is a 4-byte IPv4 address.
  - When T = 0x02, A is 1-byte length (L) + L bytes domain name.
  - When T = 0x03, A is a 16-byte IPv6 address.
- **Checksum F**: FNV1a hash of all content in the command section except F.

### Data Section

When Opt(S) is enabled, the data section uses this format. The actual request data is split into several small chunks, each formatted as follows. The server verifies all small chunks before forwarding them according to the basic format.

| 2 bytes | L bytes |
| :---: | :---: |
| Length L | Data Packet |

Where:

- **Length L**: Integer in Big Endian format, maximum value is 2^14.
  - When Opt(M) is enabled, Value of L = Real Value xor Mask. Mask = (RequestMask.NextByte() << 8) + RequestMask.NextByte().
- **Data Packet**: Data packet encrypted by the specified encryption method.

Before transmission ends, the data packet must contain actual data (data other than length and authentication data). When transmission ends, the client must send an empty data packet, i.e., L = 0 (no encryption) or length of authentication data (with encryption), to indicate the end of transmission.

Depending on the encryption method, the data packet format is as follows:

- **No encryption**:
  - L bytes: Actual data.
- **AES-128-CFB**: The entire data section is encrypted using AES-128-CFB.
  - 4 bytes: FNV1a hash of actual data.
  - L - 4 bytes: Actual data.
- **AES-128-GCM**: Key is the Key from the Command Section, IV = count (2 bytes) + IV (10 bytes). count starts from 0 and increments by 1 for each packet; IV is the 3rd to 12th bytes of the Command Section IV.
  - L - 16 bytes: Actual data.
  - 16 bytes: GCM authentication info.
- **ChaCha20-Poly1305**: Key = MD5(Command Section Key) + MD5(MD5(Command Section Key)), IV = count (2 bytes) + IV (10 bytes). count starts from 0 and increments by 1 for each packet; IV is the 3rd to 12th bytes of the Command Section IV.
  - L - 16 bytes: Actual data.
  - 16 bytes: Poly1305 authentication info.

## Server Response

The response header data is encrypted using AES-128-CFB, with IV being MD5(Data Encryption IV) and Key being MD5(Data Encryption Key). The actual response data varies depending on encryption settings.

| 1 byte | 1 byte | 1 byte | 1 byte | M bytes | Remaining part |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Response Auth V | Option Opt | Command Cmd | Command Length M | Command Content | Actual Response Data |

Where:

- **Response Auth V**: Must match the Response Auth V in the client request.
- **Option Opt**:
  - 0x01: Server is ready to reuse TCP connection (Deprecated in Xray 2.23+).
- **Command Cmd**:
  - 0x01: Dynamic port command.
- **Actual Response Data**:
  - If Opt(S) in the request was enabled, standard format is used; otherwise, basic format is used.
  - The format is the same as the request data.
    - When Opt(M) is enabled, Value of Length L = Real Value xor Mask. Mask = (ResponseMask.NextByte() << 8) + ResponseMask.NextByte().

### Dynamic Port Command

| 1 byte | 2 bytes | 16 bytes | 2 bytes | 1 byte | 1 byte |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Reserved | Port | User ID | AlterID | User Level | Validity Time T |

Where:

- **Port**: Integer port number in Big Endian format.
- **Validity Time T**: Number of minutes.

When the client receives a dynamic port command, the server has opened a new port for communication, and the client can send data to the new port. After T minutes, this port will expire, and the client must resume using the main port for communication.

## Notes

- To ensure forward compatibility, the values of all reserved fields must be 0.

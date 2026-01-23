# [Chapter 9] Appendix

## 1. Index of Basic Linux Commands for Beginners

|    ID    | Command Name        | Description                                        |                       Featured Chapter                        |
| :------: | :------------------ | :------------------------------------------------- | :-----------------------------------------------------------: |
| `cmd-01` | `apt update`        | Check for software updates                         |          [[Chapter 3: Remote Login]](./ch03-ssh.md)           |
| `cmd-02` | `apt upgrade`       | Execute software updates                           |          [[Chapter 3: Remote Login]](./ch03-ssh.md)           |
| `cmd-03` | `nano`              | Text editor                                        |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-04` | `systemctl restart` | Restart a service                                  |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-05` | `adduser`           | Add a new user to the system                       |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-06` | `apt install`       | Install a software package                         |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-07` | `visudo`            | Dedicated editor for sudo privileges               |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-08` | `sudo`              | Run a command with `root` privileges               |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-09` | `chmod`             | Change permissions of a file/folder                |    [[Chapter 4: Security Protection]](./ch04-security.md)     |
| `cmd-10` | `mkdir`             | Create a new directory (folder)                    |      [[Chapter 5: Website Building]](./ch05-webpage.md)       |
| `cmd-11` | `systemctl reload`  | Reload a service                                   |      [[Chapter 5: Website Building]](./ch05-webpage.md)       |
| `cmd-12` | `wget`              | Access (or download) a web file                    | [[Chapter 6: Certificate Management]](./ch06-certificates.md) |
| `cmd-13` | `acme.sh`           | Commands related to acme.sh certificate management | [[Chapter 6: Certificate Management]](./ch06-certificates.md) |
| `cmd-14` | `rm`                | Remove (delete) command                            |       [[Chapter 7: Xray Server]](./ch07-xray-server.md)       |
| `cmd-15` | `crontab -e`        | Edit current user's scheduled tasks                |       [[Chapter 7: Xray Server]](./ch07-xray-server.md)       |
| `cmd-16` | `touch`             | Create an empty file                               |       [[Chapter 7: Xray Server]](./ch07-xray-server.md)       |
| `cmd-17` | `systemctl`         | Basic `systemd` service management command         |       [[Chapter 7: Xray Server]](./ch07-xray-server.md)       |
| `cmd-18` | `reboot`            | Reboot the Linux system                            |       [[Chapter 7: Xray Server]](./ch07-xray-server.md)       |

## 2. Index of Important Linux Configuration Files for Beginners

|    ID     | Config File Location                    | File Description                          |                  Featured Chapter                  |
| :-------: | :-------------------------------------- | :---------------------------------------- | :------------------------------------------------: |
| `conf-01` | `/etc/ssh/sshd_config`                  | SSH remote login program settings         |     [[Chapter 3: Remote Login]](./ch03-ssh.md)     |
| `conf-02` | `/etc/nginx/nginx.conf`                 | Nginx program settings                    | [[Chapter 5: Website Building]](./ch05-webpage.md) |
| `conf-03` | `/etc/apt/sources.list`                 | apt software source list                  | [[Chapter 7: Xray Server]](./ch07-xray-server.md)  |
| `conf-04` | `/etc/apt/sources.list.d/vpsadmin.list` | User-defined software source list         | [[Chapter 7: Xray Server]](./ch07-xray-server.md)  |
| `conf-05` | `crontab -e`                            | Current user's scheduled tasks            | [[Chapter 7: Xray Server]](./ch07-xray-server.md)  |
| `conf-06` | `/etc/sysctl.conf`                      | Manual kernel parameter settings          | [[Chapter 7: Xray Server]](./ch07-xray-server.md)  |
| `conf-07` | `/etc/sysctl.d/vpsadmin.conf`           | User-defined kernel parameter config file | [[Chapter 7: Xray Server]](./ch07-xray-server.md)  |

## 3. Index of Important Xray Files for Beginners

|    ID     | Config File Location                 | File Description      |                 Featured Chapter                  |
| :-------: | :----------------------------------- | :-------------------- | :-----------------------------------------------: |
| `xray-01` | `/usr/local/etc/xray/config.json`    | Xray program settings | [[Chapter 7: Xray Server]](./ch07-xray-server.md) |
| `xray-02` | `/home/vpsadmin/xray_cert/xray.cert` | TLS Certificate       | [[Chapter 7: Xray Server]](./ch07-xray-server.md) |
| `xray-03` | `/home/vpsadmin/xray_cert/xray.key`  | TLS Private Key       | [[Chapter 7: Xray Server]](./ch07-xray-server.md) |
| `xray-04` | `/home/vpsadmin/xray_log/access.log` | Xray Access Log       | [[Chapter 7: Xray Server]](./ch07-xray-server.md) |
| `xray-05` | `/home/vpsadmin/xray_log/error.log`  | Xray Error Log        | [[Chapter 7: Xray Server]](./ch07-xray-server.md) |

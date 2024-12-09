# acn-js
not sure how far I will take this but messing around with E1.17 ACN protocol

## packet decoding
- rlp
- sdt
  - vectors    
    - [x] JOIN
    - [x] JOIN_REFUSE
    - [x] JOIN_ACCEPT
    - [x] LEAVING
    - [x] NAK
    - [x] REL_WRAP
    - [x] UNREL_WRAP
    - [x] GET_SESSIONS
    - [ ] SESSIONS
    - [x] ACK
    - [ ] CHANNEL_PARAMS
    - [ ] LEAVE
    - [x] CONNECT
    - [x] CONNECT_ACCEPT
    - [x] CONNECT_REFUSE
    - [x] DISCONNECT
    - [x] DISCONNECTING
- dmp
  - vectors    
    - [ ] GET_PROPERTY
    - [ ] SET_PROPERTY
    - [ ] GET_PROPERTY_REPLY
    - [ ] EVENT
    - [ ] SUBSCRIBE
    - [ ] UNSUBSCRIBE
    - [ ] GET_PROPERTY_FAIL
    - [ ] SET_PROPERTY_FAIL
    - [ ] SUBSCRIBE_ACCEPT
    - [ ] SUBSCRIBE_REJECT
    - [ ] SYNC_EVENT
- ddl

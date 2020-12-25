**Note:** This is just and experiment and completely unusable at the moment. I'd be happy to cooperate with other drone and UAV enthusiasts and experts.

The goal is to build a web-based ground control station and other necessary software components for my DIY drone, and possibly other RC vehicles.

## Hardware

Note that this is my first DIY drone and I haven't received most of the hardware yet. I'm sure I have messed up at least some decisions.

 - **Type:** Hexacopter; 625mm frame, 10'' propellers, 2600KV motors
 - **Flight controller:** Navio2 on Raspberry Pi 3 B+ with stock Navio2 image except using Ardupilot from from [official Git master](https://github.com/ArduPilot/ardupilot)
 - **RC link:** Crossfire; Diversity Nano RX, Standard transmitter
 - **Radio controller:** RadioMaster TX16S

## Software

Since I only have FC and RC equipment at the time of writing this, I'm just playing around with these.

**Some ideas:**

 - WebRTC over 4G and possibly 5G  for streaming video, telemetry and MAVLink commands
 - Finding a way to talk to Crossfire transmitter via WebUSB and possibly use that for lower latency.
 - I might need light-weight backend for low-level UDP and USB communication
 - Web Gamepad API
 - Using powerful (10W+ & high-gain antennas) amateur radio equipment and protocols for long-range communication. Needs some research

# A word on WebRTC

*just some notes for myself since I do not have a blog*

I need an application running on Raspberry Pi 3, which (a) sends video stream to ground over WebRTC and (b) proxies MAVLink messages between WebRTC and virtual serial port (for ArduPilot).

## First experiences

I have been doing [similar thing](https://github.com/keijokapp/tank) before. However, the app was running in Chrome on Android phone and used WebUSB to communicate with Arduino Micro. And it was a nightmare. For 2 reasons:

 1. Android (and web browsers in general) really doesn't want to give system resources to application easily. Things like autoplay, autocapture & WebUSB does not work consistently. And when phone decides to go to sleep or anything, it's pretty much over. I wonder if I had implemented it as a PWA, maybe it would have been easier.
 2. Chrome's WebRTC implementation had this massive umbrella [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=980872) which made stable connection negotiation extremely hard (especially when the same code had to also work on other browsers). Thankfully, it's fixed by now but as a result of this, I try to avoid any tool which shows signs of not following the latest WebRTC standard.

Also, sometimes peers decided to send data through TURN server (for no apparent reason) over TCP (also, for no apparent reason), making the video almost unusable in terms of quality and latency.

But it somewhat worked. Now I have more serious plans. I still want to use web technologies as much as possible, but I have lower-level environment and need much more error-resilient, flexible and low-latency implementation. I want to be able to control every bit and how it flows through the network. Plus, it has to seamlessly work with existing drone hardware (cameras, gimbals, radio link etc.) and software (ArduPilot).

Ideally, I would use some systems programming language. I was looking for options to writing a WebRTC peer in C, C++ or Rust. My experience with Rust has been somewhat hellish due to its immaturity, so I didn't think more about it. With C++ there's essentially 2 options: using Chromium's WebRTC library (sounds like a nightmare) or using [libdatachannel](https://github.com/paullouisageneau/libdatachannel) which seems to have excellent C++ API with C bindings. The latter doesn't do any encoding and media capturing/playback itself though but that's not much of a problem for me.

So I started playing around with libdatachannel. However, perfectionist as I am, I became afraid that C++ doesn't give me enough flexibility for future ideas. Like, even just adding a dependency to CMake project might be a day-long job. Sure, there are awesome pieces of software written i C++ but every single time I've seen some C++ app, it's has seen some massive development resources compared to NodeJS app of same scale. I need to iterate quickly, but I also want all the efficiency and low-level features of C++.

Alternatively, there's a way to implement application logic in NodeJS. Again, we have some options:
 1. [node-webrtc](https://github.com/node-webrtc/node-webrtc) library based on Chromiums implementation. The problem is, it doesn't give me the full control over what goes through the network and it's not up to date with latest standard (e.g. no support for `setLocalDescription` without and argument), which is very problematic due to bad past experiences.
 2. Create a NodeJS addon with libdatachannel. I've tried to create NodeJS addons previously and it doesn't seem to be *too hard* on its own but integrating third-part library certainly gives some complications. That's something I'm thinking right now.
 3. Create my own WebRTC implementation in NodeJS. It doesn't seem noticeably harder than creating addon. I would need to build a Javascript API, encoding and capturing parts anyway. It would also give me valuable experience in the field and full control over everything. The result probably won't cover all WebRTC features, at least not in a standard-compliant way. That's my current goal.


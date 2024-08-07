<p align="center">
  <img width="150px" src="https://singulatron.com/assets/logo-lighter.svg" />
  <div align="center">
    <span>
      <h1>Singulatron</h1>
    </span>
    <div>Run and develop self-hosted AI apps.</div>
    <div>
      <a href="https://superplatform.ai">superplatform.ai</a> 
    </div>
  </div>
</p>

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/eRXyzeXEvM)](https://discord.gg/eRXyzeXEvM)

Singulatron is an open-source server daemon and web client that empowers you to self-host and interact with LLMs.

It goes beyond chat functionality, enabling you to develop language-agnostic applications by harnessing Singulatron's AI infrastructure. Dive in and start building today!

## Roadmap

- [x] AI functionality: prompting, prompt queues, threads, download manager
- [x] Streaming, real time updates
- [x] User management: multi-user support, role-based access control
- [x] Support different database backends (local files, SQL and more is coming) and other distributed primitives
- [ ] Collaborate with other users in your organization
- [ ] Publish clients for the daemon in different languages
- [ ] Running, scheduling mini-(or not so mini)-apps built on top of Singulatron
- [ ] Many more

![Run](https://singulatron.com/assets/chat.png?refresh=1)

## Run On Your Servers

See [this document](./docs/start/index.md) to help you get started.

## Run On Your Laptop/PC

Download as a binary for your laptop or PC for Windows or Linux from the website: https://singulatron.com/home  
MacOS support is coming soon.

**Note/Troubleshooting**: currently the focus is on server setups. If the app doesn't want to work on your machine, just make sure Docker is running on your system, as the Docker/VM installation is not entirely reliable on every machine yet.

## Why

We bought quite a few beefy GPUs for our servers but realized we need good software to be able to experiment quickly.
Singulatron aims to be both a desktop app for local usage and also to work as a distributed daemon to drive servers, with a web app frontend client that is the same as the local app.

## Highlights

- [Private](./docs/privacy.md): your chats never leave your computer. Works even without an internet connection
- User management with role based access control: control who can do what in your self hosted installation
- Real-time and fast: utilize your hardware and your time to their full extent
- The prompt queue system lets you input many prompts at once - even across threads - they will be processed sensibly. You can leave threads and return - streaming won't be interrupted
- A download manager makes sure your models are well kept
- Run as a binary (exe, deb etc) locally, or on your servers

## Stack

It is an Electron application, with Angular on the frontend and Go on the backend. It becomes a simple web app without electron when hosted over the network.

## License

Singulatron is licensed under AGPL-3.0.

## Status

Fairly early phase but there are quite a few installations chugging along nicely already. Why don't you join them?

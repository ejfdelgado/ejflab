FROM --platform=linux/x86_64 node:18

USER root

# change root password
RUN echo 'root:root' | chpasswd

ENV DEBIAN_FRONTEND noninteractive

# install ssh server
RUN apt-get update && apt-get install -y \
  openssh-server sudo \
  && rm -rf /var/lib/apt/lists/*

# workdir for ssh
RUN mkdir -p /run/sshd

# generate server keys
RUN ssh-keygen -A

# allow root to login
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config

EXPOSE 22

# run ssh server
CMD ["/usr/sbin/sshd", "-D", "-o", "ListenAddress=0.0.0.0"]


Puertos que deben quedar abiertos:
8081 NodeServer: http://127.0.0.1:8081/uechat
8083 Php MyAdmin: http://127.0.0.1:8083/



//Crear carpetas:
mkdir -p "${HOME}/server/mysql-phpmyadmin/data"
mkdir "${HOME}/desarrollo"
mkdir "${HOME}/.ssh"

// Instalar:
apt-get install git
apt-get install vim
apt-get install nodejs
apt-get install npm
apt-get install gnupg wget -y
// docker compose

// Configurar git
git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"

// Configurar la llave para git
cd  ~/.ssh
ssh-keygen -t ed25519 -C "edgar.jose.fernando.delgado@gmail.com" -f id_ed25519_policevr
eval `ssh-agent -s`

// Crear el archivo
vi ~/.ssh/config
// Con el contenido
IdentityFile ~/.ssh/id_ed25519_policevr

ssh-add ~/.ssh/id_ed25519_policevr
vi ~/.ssh/id_ed25519_policevr.pub



// Descargar y actualizar el proyecto
cd ~/desarrollo
git clone git@github.com:ejfdelgado/ejflab.git
cd ~/desarrollo/ejflab
npm install

// Open port 8081

// Para actualizar el código:
cd ~/desarrollo/ejflab && git pull && npm install && npm run build_local

// Para correr el servidor:
npm run start

npm cache clean
rm -rf $TMPDIR/npm-*

// Problemas con npm y nodejs:
// Solución 1
rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node*
rm -rf /usr/local/bin/node*
rm -rf /usr/local/include/node*
wget https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz
tar -xf node-v20.10.0-linux-x64.tar.xz
mv ./node-v20.10.0-linux-x64/bin/* /usr/local/bin/
mv ./node-v20.10.0-linux-x64/lib/node_modules/ /usr/local/lib/

// Solución 2
rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node*
rm -rf /usr/local/bin/node*
rm -rf /usr/local/include/node*
apt-get purge nodejs npm
apt autoremove
apt-get autoremove
apt-get install npm

// Adding environment variables
vi ~/.profile
. ~/.profile

// Clear linux
cd /tmp && rm -rf *

luego lanzar el docker:
cd ~/desarrollo/ejflab/containers/police-docker
service docker start
service docker status
docker compose up -d

apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
apt install docker-ce
systemctl status docker

usermod -aG docker ${USER}
su - ${USER}

vi /usr/lib/systemd/system/docker.service

curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version

chmod +x localrun.sh
./localrun.sh

service docker stop
service docker start
service docker restart
service docker status
dockerd
docker context ls


docker volume create policiavr_volume
mv /var/lib/docker_old/* /var/lib/docker

df -h /
df -h /var/lib/docker
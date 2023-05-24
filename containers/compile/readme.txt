sudo docker build --platform linux/x86_64 -t ejfdelgado/compile:v0.1 .

sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name compile -p 41061:22 ejfdelgado/compile:v0.2

sudo docker run --platform linux/x86_64 -v /home/ejfdelgado/desarrollo/c++:/tmp/sources -v /home/ejfdelgado/desarrollo/ejflab/c++:/tmp/sources/workspace --name compile -p 41061:22 ejfdelgado/compile:v0.2

sudo docker ps
sudo docker stop 102f4a4719a7
sudo docker rm 17c02650647813dd819e5769e078cccee2017b4d97f53b1ebab821bb361bfcb8

ssh root@localhost -p 41061
//use password root

sudo docker commit 0a47e0269e5c  ejfdelgado/compile:v0.2

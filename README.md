# Ejflab1

git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"
gcloud config set account edgar.jose.fernando.delgado@gmail.com
export GOOGLE_APPLICATION_CREDENTIALS=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-c2ef2a890ca5.json
export GOOGLE_APPLICATION_CREDENTIALS=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-f1c7c49b937c.json
gcloud projects list --sort-by=projectId --limit=5
gcloud config set project ejfexperiments
gcloud projects get-iam-policy ejfexperiments
export ENV=pro

gcloud auth login

sudo docker build --platform linux/x86_64 -t ejfdelgado/mainapp:v1.0 .
Successfully tagged ejfdelgado/mainapp:v1.0

sudo docker images

sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name mainapp -p 80:8080 ejfdelgado/mainapp:v1.0

sudo docker ps

sudo docker kill 7bfe7bcc214d

sudo docker container prune 

sudo docker login -u your_dockerhub_username 
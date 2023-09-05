## Local
## export OpenCV_DIR=/home/ejfdelgado/desarrollo/vaale/build
## export nlohmann_json_DIR=/home/ejfdelgado/desarrollo/c++/build-local/json-3.11.2
## export PortAudio_DIR=/usr/local/lib/cmake/portaudio
## cd /home/ejfdelgado/desarrollo/ejflab/c++/audiosfft
## sudo rm -R build && mkdir build && cd build
## cmake ../ && make -j 8
## chmod +x Audiosfft
## ./Audiosfft "1"

cmake_minimum_required(VERSION 2.8)
project( Audiosfft )
find_package( OpenCV REQUIRED )
find_package(nlohmann_json 3.11.2 REQUIRED)
find_package( portaudio REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} ${portaudio_INCLUDE_DIRS} )
add_executable( Audiosfft Audiosfft.cpp )
add_executable( recordPlay recordPlay.cpp )
target_link_libraries( Audiosfft ${OpenCV_LIBS} nlohmann_json::nlohmann_json "/usr/local/lib/libportaudio.so")
target_link_libraries( recordPlay ${OpenCV_LIBS} nlohmann_json::nlohmann_json "/usr/local/lib/libportaudio.so")
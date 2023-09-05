#ifndef __utils_h__
#define __utils_h__

#include <cstdio>
#include <iostream>
// #include <map>
// #include <iterator>
#include <fstream>
#include <string>
#include <regex>
#include <sstream>
#include <unordered_map>
// https://github.com/nlohmann/json/tree/v3.11.2#cmake
#include <nlohmann/json.hpp>
using json = nlohmann::json;
using namespace std;

std::string readTextFile(std::string path)
{
  ifstream fileStream(path.c_str());
  std::stringstream buffer;
  buffer << fileStream.rdbuf();
  return buffer.str();
}

void writeTextFile(std::string data, std::string path)
{
  std::ofstream out(path.c_str());
  out << data;
  out.close();
}

/*
  std::map<std::string, double> mapa = json2Map<double>(&data);
  std::cout << mapa["texto"] << std::endl;
*/
template <typename T>
std::map<std::string, T> json2Map(json *v2)
{
  std::map<std::string, T> map;

  for (auto &el : v2->items())
  {
    map[el.key()] = el.value();
  }

  return map;
}

template <typename T>
std::map<std::string, T> map2Json(std::map<std::string, T> *map)
{
  json output;

  typename std::map<std::string, T>::iterator it = map->begin();

  // Iterating over the map using Iterator till map end.

  while (it != map->end())
  {
    // Accessing the key
    std::string word = it->first;
    // Accessing the value
    output[word] = it->second;
    it++;
  }

  return output;
}

#endif
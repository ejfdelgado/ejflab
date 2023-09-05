#ifndef __utils_h__
#define __utils_h__

#include <cstdio>
#include <iostream>
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

#endif
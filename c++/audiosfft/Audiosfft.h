/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#ifndef __audiosfft_h__
#define __audiosfft_h__

#include <iostream>
#include <string>
#include "opencv2/core/core.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include <nlohmann/json.hpp>
#include <opencv2/opencv.hpp>

using json = nlohmann::json;

cv::Mat createGrayScaleImage(int height, int width, uchar value)
{
    cv::Mat mat(height, width, CV_8UC1, cv::Scalar(value));
    return mat;
}

void showImage(cv::Mat *mat)
{
    cv::imshow("gray", *mat);
}

#endif
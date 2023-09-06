/**
 * This program takes a set of corresponding 2D and 3D points and finds the transformation matrix
 * that best brings the 3D points to their corresponding 2D points.
 */
#ifndef __audiosfft_h__
#define __audiosfft_h__

#define IMAGE_MAT_TYPE unsigned char

#include <cmath>
#include <iostream>
#include <string>
#include "opencv2/core/core.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/calib3d/calib3d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include <nlohmann/json.hpp>
#include <opencv2/opencv.hpp>
#include "audio.h"

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

void printAudioOnImage(cv::Mat *mat, UserAudioData *audioData, json *inputData)
{
    unsigned int i;
    unsigned int interpolated;
    unsigned int height = mat->rows;
    unsigned int width = mat->cols;
    IMAGE_MAT_TYPE *input = (IMAGE_MAT_TYPE *)(mat->data);
    float maxValue = (*inputData)["MAX_AMPLITUD"];
    const unsigned int bufferSize = audioData->maxSize;
    SAMPLE *buffer = audioData->line;

    for (i = 0; i < width; i++)
    {
        interpolated = floor(bufferSize * i / width);
        float val = buffer[interpolated] / maxValue;
        if (val > 1)
        {
            val = 1;
        }
        else if (val < -1)
        {
            val = -1;
        }
        val = 256 * (val + 1) / 2;

        for (int j = 0; j < mat->rows; j++)
        {
            input[mat->cols * j + i] = (unsigned char)val;
        }
    }
}

#endif
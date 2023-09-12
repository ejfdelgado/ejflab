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

cv::Mat createBaseDft(unsigned int windowSize)
{
    cv::Mat audio(windowSize, 1, CV_32S, cv::Scalar::all(0));
    return audio;
}

void showImage(cv::Mat *mat)
{
    cv::imshow("gray", *mat);
}

void computeDft(cv::Mat *audio, UserAudioData *audioData, json *inputData, cv::Mat *spectrogram)
{
    if (!audioData->gapReady)
    {
        return;
    }
    // Turn off flag
    audioData->countGap = 0;
    audioData->gapReady = false;
    // Compute!
    // std::cout << "Compute dft and add it!" << std::endl;

    float val;
    SAMPLE *buffer = audioData->line;
    float maxValue = (*inputData)["MAX_AMPLITUD"];
    const unsigned int bufferSize = audioData->maxSize;
    const unsigned int offset = bufferSize - audioData->maxGap;
    // Se copia la señal de audio a la matriz
    for (int i = 0; i < audioData->maxGap; i++)
    {
        val = buffer[offset + i];
        val = val / maxValue;
        if (val > 1)
        {
            val = 1;
        }
        else if (val < -1)
        {
            val = -1;
        }
        // val = 256 * (val + 1) / 2; // [0, 255]
        val = 256 * val; // [-255, 255]
        audio->at<int>(i) = val;
    }
    cv::Mat planes[] = {cv::Mat_<float>(*audio), cv::Mat::zeros(audio->size(), CV_32F)};
    cv::Mat complexI;
    cv::merge(planes, 2, complexI);                 // Add to the expanded another plane with zeros
    cv::dft(complexI, complexI);                    // this way the result may fit in the source matrix
    cv::split(complexI, planes);                    // planes[0] = Re(DFT(I), planes[1] = Im(DFT(I))
    cv::magnitude(planes[0], planes[1], planes[0]); // planes[0] = magnitude
    cv::Mat magI = planes[0];
    magI = magI(cv::Rect(0, 0, 1, audioData->maxGap / 2));
    magI += cv::Scalar::all(1); // switch to logarithmic scale
    cv::log(magI, magI);
    // Represent Information
    cv::Mat line;
    magI.copyTo(line);
    cv::resize(line, line, cv::Size(1, (*inputData)["DFT_HEIGHT"]));
    // Normalize values to the Range : 0.0 to 1.0
    cv::normalize(line, line, 0, 1, cv::NORM_MINMAX);
    cv::flip(line, line, 0);
    // cv::hconcat(line, spectrogram->colRange(0, spectrogram->cols - 1), *spectrogram);
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
#include "portaudio.h"
#include <stdio.h>

#define SAMPLE_RATE (44100)

typedef struct
{
    float left_phase;
    float right_phase;
} paTestData;
/* This routine will be called by the PortAudio engine when audio is needed.
 * It may called at interrupt level on some machines so don't do anything
 * that could mess up the system like calling malloc() or free().
 */
static int patestCallback(const void *inputBuffer, void *outputBuffer,
                          unsigned long framesPerBuffer,
                          const PaStreamCallbackTimeInfo *timeInfo,
                          PaStreamCallbackFlags statusFlags,
                          void *userData)
{
    /* Cast data passed through stream to our structure. */
    paTestData *data = (paTestData *)userData;
    float *out = (float *)outputBuffer;
    unsigned int i;
    (void)inputBuffer; /* Prevent unused variable warning. */

    // std::cout << framesPerBuffer << std::endl;
    for (i = 0; i < framesPerBuffer; i++)
    {
    }
    return 0;
}

PaStream *sampleAudio(paTestData *data, PaStream *stream, PaStreamParameters *inputParameters)
{
    PaError err;
    inputParameters->sampleFormat = paUInt8;
    inputParameters->suggestedLatency = Pa_GetDeviceInfo(inputParameters->device)->defaultLowInputLatency;
    inputParameters->hostApiSpecificStreamInfo = NULL;
    /* Open an audio I/O stream. */
    // Read Pa_OpenStream
    /*
    err = Pa_OpenDefaultStream(&stream,
                               0,         // no input channels
                               1,         // The number of channels of sound to be delivered to the stream callback
                               paFloat32, // 32 bit floating point output
                               SAMPLE_RATE,
                               256,            // frames per buffer, i.e. the number
                               patestCallback, // this is your callback function
                               &data);         // This is a pointer that will be passed
                               */
    err = Pa_OpenStream(
        &stream,
        inputParameters,
        NULL,
        SAMPLE_RATE,
        paFramesPerBufferUnspecified,
        paClipOff,
        patestCallback,
        &data);
    if (err != paNoError)
    {
        printf("Pa_OpenDefaultStream error: %s\n", Pa_GetErrorText(err));
        return NULL;
    }

    err = Pa_StartStream(stream);
    if (err != paNoError)
    {
        printf("Pa_StartStream error: %s\n", Pa_GetErrorText(err));
        return NULL;
    }
    else
    {
        printf("Pa_StartStream ok: %p\n", stream);
        return stream;
    }
}

bool initializeAudio()
{
    PaError err = Pa_Initialize();
    if (err != paNoError)
    {
        printf("Pa_Initialize error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}

bool terminateAudio(PaStream *stream)
{
    PaError err;
    err = Pa_CloseStream(stream);
    if (err != paNoError)
    {
        printf("Pa_CloseStream error: %p %s\n", stream, Pa_GetErrorText(err));
        return false;
    }
    err = Pa_Terminate();
    if (err != paNoError)
    {
        printf("Pa_Terminate error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}
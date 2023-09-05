#include "portaudio.h"
#include <stdio.h>

bool initializeAudio()
{
    PaError err = Pa_Initialize();
    if (err != paNoError)
    {
        printf("PortAudio error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}

bool terminateAudio()
{
    PaError err = Pa_Terminate();
    if (err != paNoError)
    {
        printf("PortAudio error: %s\n", Pa_GetErrorText(err));
        return false;
    }
    return true;
}
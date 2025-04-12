from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
from datetime import datetime
import io
import sys
from powerschool.powerschool import PSLData
from django.shortcuts import render
from powerschool.powerschool.spiders.psl import PslSpider

#import gpeclub.data_initiator



"""
def index(request):
    #return render(request,'test.html')
    #return render(request,'heros.html')
    #return render(request,'footer.html')
    #return render(request, 'header.html')
    return render(request,'index.html')
"""
username = ''
def header(request):
    return render(request,'header.html')

def about(request):
    return render(request,'about.html')

def vocab(request):
    return render(request,'vocab.html')
from django.http import JsonResponse
import os
from django.conf import settings
import json
def final_data(request):
    # Define the path to the JSON file
    json_path = os.path.join(settings.BASE_DIR, 'static', 'assets', 'js', 'final_data.json')

    # Read and return the JSON data
    try:
        with open(json_path, 'r') as json_file:
            data = json.load(json_file)
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': 'Failed to load data'}, status=500)






from django.shortcuts import render
def school(request):
    current_date = datetime.now()
    return render(request, 'school.html', {'current_date': current_date} )


import IndividualProjects.superticktacktoe.localviews as superttt
import IndividualProjects.photo1.localviews as photo
import IndividualProjects.trigonomis.localviews as trigonomis1

def supertictactoe(request):
    return superttt.view_index(request)

import IndividualProjects.polyptoton.localviews as polyptotonView
def polyptoton(request):
    return polyptotonView.view_index(request)

def politics(request):
    return render(request, 'projects/8values/index.html')
def instructions(request):
    return render(request, 'projects/8values/instructions.html')
def quiz(request):
    return render(request, 'projects/8values/quiz.html')
def results(request):
    return render(request, 'projects/8values/results.html')

def photo1(request):
    return render(request,'projects/photo1/index.html')

def trigonomis(request):
    return render(request,'projects/trigonomis/index.html')

def invective(request):
    return render(request,'projects/invective/index.html')

def index(request):
    current_date = datetime.now()
    return render(request, 'index.html', {'current_date': current_date})

def old(request):
    current_date = datetime.now()
    return render(request, 'index_new.html', {'current_date': current_date} )

def privacy(request):
    return render(request, 'privacy.html')

from gpeclub.models import psl
import time
import os
def powerschool(request):
    global username
    #time.sleep(2)
    avg_txt = os.path.join('powerschool/grades/', f'{username}avg.txt')
    with open(avg_txt, 'r') as file:
        avg = file.read()
    print(avg)
    gpa = avg
    #username = request.GET.get('username')
    txt = os.path.join('powerschool/grades/', f'{username}.txt')
    with open(txt, 'r') as file:
        grades = file.read()
    lines = grades.splitlines()
    try:
        os.remove(txt), os.remove(avg_txt)
    except:
        pass
    return render(request, 'powerschool.html', {'lines': lines, 'gpa': gpa})

def isocolon(request):
    return render(request,'projects/isocolon/index.html')

def supertictactoe(request):
    return superttt.view_index(request)

import IndividualProjects.satPrep.vocab_web as vocab_web
def vocabList(request):
    return vocab_web.view_vocab_list(request)

def vocabSet(request, set_name):
    context = {
        'set_name': set_name,
    }
    return vocab_web.view_vocab_set(request, set_name)

def ai(request, set_name):
    context = {
        'set_name': set_name,
    }
    return vocab_web.view_vocab_ai(request, set_name)
def mcq(request, set_name):
    context = {
        'set_name': set_name,
    }
    return vocab_web.view_vocab_mcq(request, set_name)

'''
def vocab_data_response_generator(json_name):
    return lambda request: vocab_data(json_name)
'''

def vocab_set_data(request, set_name):
    return vocab_data(set_name)

import IndividualProjects.satPrep.vocabUtils as vocabUtils
def vocab_data(json_name):
    json_path = os.path.join(settings.BASE_DIR, 'static', 'vocab', '{}.json'.format(json_name))

    # Read and return the JSON data
    try:
        with open(json_path, 'r') as json_file:
            data = vocabUtils.VocabSet(json.load(json_file))
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': 'Failed to load data'}, status=500)

def phys2(request):
    return render(request,'projects/phys2/index.html')
def phys2u2(request):
    return render(request,'projects/phys2/index2.html')

from django.http import JsonResponse
import json
from pslCrawlAPI import crawl_account
def run_crawltest(request):
    global username
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('usr')
        password = data.get('pw')

        try:
            crawl_account(username, password)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .route_mapper import RouteMapper
from openai import OpenAI
import logging
import re

# Set up logging
logger = logging.getLogger(__name__)


@csrf_exempt  # Use with caution; prefer proper CSRF protection
def get_openai_response(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prompt = data.get('prompt', '').strip()
            user_input = data.get('input', '').strip()
            model = data.get('model', 'gpt-4o-mini')
            max_tokens = int(data.get('max_tokens', 150))

            if not prompt or not user_input:
                return JsonResponse({'error': 'Both prompt and input are required.'}, status=400)

            # Initialize the route mapper
            route_mapper = RouteMapper()
            possible_route = route_mapper.get_route(user_input)

            # Enhance the prompt with website info and navigation capabilities
            website_info = """
            The GPE Club website has the following pages and features:

            - Home page (/): The main landing page with general information about GPE Club
            - Projects (/projects/search/): Browse various projects created by GPE Club
            - Vocab List (/vocab/list): List of vocabulary sets for practice
            - Vocab AI (/vocab/ai/set1/): AI-powered vocabulary practice
            - Vocab MCQ (/vocab/mcq/set1/): Multiple choice vocabulary questions
            - School (/projects/school/): School-related tools and resources
            - PowerSchool (/projects/powerschool/): PowerSchool grade viewer
            - About (/about/): Information about GPE Club and its members

            Special projects include:
            - Trigonomis (/projects/trigonomis/): A math-based game available on Steam
            - Super Tic Tac Toe (/projects/supertictactoe/): An advanced version of Tic Tac Toe
            - Politics Quiz (/politics/): A political orientation test

            If the user is asking about a specific page or feature, include a line at the END of your response in this EXACT format:
            NAVIGATE: /path/to/page

            For example: NAVIGATE: /vocab/list

            Make sure the URL path is exact, with no spaces or extra characters.
            Keep your response concise and focused on answering the user's question.
            """

            enhanced_prompt = f"{prompt}\n\n{website_info}"

            # Define the messages structure for OpenAI Chat API
            client = OpenAI()
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": enhanced_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=max_tokens
            )

            # Extract the assistant's reply
            ai_response = completion.choices[0].message.content

            logger.debug(f"Received prompt: {prompt}")
            logger.debug(f"User input: {user_input}")
            logger.debug(f"Model: {model}")
            logger.debug(f"AI response: {ai_response}")

            # Check if the response includes navigation instructions
            navigate_to = None

            # Look for NAVIGATE: instruction with proper regex
            nav_regex = re.compile(r'NAVIGATE:\s*(\S+)$', re.MULTILINE)
            nav_match = nav_regex.search(ai_response)

            if nav_match:
                navigate_to = nav_match.group(1).strip()
                # Remove the navigation instruction from the response
                ai_response = nav_regex.sub('', ai_response).strip()
            # If no explicit navigation but we found a route from the query
            elif possible_route:
                navigate_to = possible_route

            # Verify the navigation URL looks valid
            if navigate_to and not navigate_to.startswith('/'):
                navigate_to = '/' + navigate_to

            # Log what we're returning
            logger.debug(f"Final response: {ai_response}")
            logger.debug(f"Navigate to: {navigate_to}")

            return JsonResponse({
                'response': ai_response,
                'navigate_to': navigate_to
            })

        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)
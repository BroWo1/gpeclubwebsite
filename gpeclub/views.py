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
def agent(request):
    # Simply render the agent template
    return render(request, 'agent.html')

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
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
import os
import requests
from urllib.parse import urlparse
from django.middleware.csrf import get_token
import mimetypes


def magazine_pdf(request, magazine_id):
    """Serve or proxy a magazine PDF file."""
    try:
        # Define a mapping of magazine_id to PDF URLs
        # These could be stored in your database instead
        magazine_pdfs = {
            'feb25': 'https://server.gpeclub.com:4000/feb_mag.pdf',
        }

        if magazine_id not in magazine_pdfs:
            raise Http404("Magazine not found")

        pdf_url = magazine_pdfs[magazine_id]

        # If PDF is on same server, serve directly
        if pdf_url.startswith('/'):
            pdf_path = os.path.join(settings.MEDIA_ROOT, pdf_url.lstrip('/'))
            if not os.path.exists(pdf_path):
                raise Http404("PDF file not found")

            with open(pdf_path, 'rb') as pdf:
                response = HttpResponse(pdf.read(), content_type='application/pdf')
                response['Content-Disposition'] = f'inline; filename="{os.path.basename(pdf_path)}"'
                return response

        # If PDF is on remote server, proxy it
        else:
            response = requests.get(pdf_url, stream=True)
            if response.status_code != 200:
                raise Http404("Failed to retrieve PDF")

            filename = os.path.basename(urlparse(pdf_url).path)
            proxy_response = HttpResponse(
                response.raw.read(),
                content_type='application/pdf'
            )
            proxy_response['Content-Disposition'] = f'inline; filename="{filename}"'
            return proxy_response

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def magazine_reader(request, magazine_id):
    """Render the magazine reader page with image-based pages."""
    # Magazine metadata with page counts
    magazine_metadata = {
        'feb25': {
            'title': 'Resolution',
            'issue': 'Issue #3',
            'date': 'February 2025',
            'total_pages': 24  # Number of page images available
        },
        'dec24': {
            'title': 'Equanimity',
            'issue': 'Issue #2',
            'date': 'December 2024',
            'total_pages': 32  # Number of page images available
        },
        'apr25': {
            'title': 'Spring',
            'issue': 'Issue #4',
            'date': 'April 2025',
            'total_pages': 32  # Number of page images available
        },
    }

    if magazine_id not in magazine_metadata:
        raise Http404("Magazine not found")

    metadata = magazine_metadata[magazine_id]

    return render(request, 'magazine_reader.html', {
        'magazine_id': magazine_id,
        'magazine_title': metadata['title'],
        'magazine_issue': metadata['issue'],
        'magazine_date': metadata['date'],
        'total_pages': metadata['total_pages']
    })
# Set up logging
logger = logging.getLogger(__name__)


@csrf_exempt  # Use with caution; prefer proper CSRF protection
def get_openai_response(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prompt = data.get('prompt', '').strip()
            user_input = data.get('input', '').strip()
            model = data.get('model', 'gpt-4.1-mini')
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
            - Magazine (/projects/school/): Issues from Spartans Magazine
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



from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import logging
from openai import OpenAI

@csrf_exempt
def upload_pdf_to_openai(request):
    # Only allow POST
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

    # Ensure a file was provided
    if 'pdfFile' not in request.FILES:
        return JsonResponse({'success': False, 'error': 'No PDF file provided.'}, status=400)

    pdf_file = request.FILES['pdfFile']
    if not pdf_file.name.lower().endswith('.pdf'):
        return JsonResponse({'success': False, 'error': 'Invalid file type. Only PDF allowed.'}, status=400)

    try:
        client = OpenAI()
        # Accept either a filesystem path or in-memory bytes tuple
        if hasattr(pdf_file, 'temporary_file_path'):
            file_arg = open(pdf_file.temporary_file_path(), 'rb')
        else:
            file_arg = (
                pdf_file.name,
                pdf_file.read(),
                pdf_file.content_type
            )

        openai_file = client.files.create(
            file=file_arg,
            purpose='assistants'
        )

        return JsonResponse({'success': True, 'file_id': openai_file.id})

    except Exception as e:
        logger.error(f"Error uploading file to OpenAI: {e}")
        return JsonResponse({'success': False, 'error': f'Failed to upload file: {str(e)}'}, status=500)

@csrf_exempt
def agent_chat(request):
    # Only allow POST
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        file_id = data.get('file_id')
        model = data.get('model', 'gpt-4.1-mini')
        max_tokens = int(data.get('max_tokens', 500))

        if not user_message:
            return JsonResponse({'error': 'Message is required.'}, status=400)

        client = OpenAI()
        assistant_id = settings.OPENAI_ASSISTANT_ID

        # Create a new thread
        thread = client.beta.threads.create()

        # Post the user message (with optional PDF attachment)
        msg_kwargs = {
            'thread_id': thread.id,
            'role': 'user',
            'content': user_message
        }
        if file_id:
            msg_kwargs['attachments'] = [{
                'file_id': file_id,
                'tools': [{'type': 'file_search'}]
            }]
        client.beta.threads.messages.create(**msg_kwargs)

        system_instruction = (
            "You are a helpful AI assistant specialized in analyzing and describing PDF documents. "
            "Answer the user's questions based *only* on the content of the PDF file attached to the user's message. "
            "Do not use any other documents or prior knowledge unless explicitly asked. "
            "Do not repeat the user's exact phrasing; instead, provide concise, structured summaries or answers based on the attached PDF content."
        )

        # Run the assistant with instructions
        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread.id,
            assistant_id=assistant_id,
            instructions=system_instruction
        )

        # Fetch the final assistant response
        messages = client.beta.threads.messages.list(
            thread_id=thread.id,
            order="desc" # Get latest messages first
        )

        # Find the latest assistant message
        assistant_response = "Sorry, I couldn't generate a response." # Default message
        for msg in messages.data:
            if msg.role == 'assistant':
                # Extract text from the content block if available
                if msg.content and len(msg.content) > 0:
                    block = msg.content[0]
                    # Ensure it's a text block before accessing text attribute
                    if block.type == 'text':
                         assistant_response = getattr(block.text, 'value', "Assistant message found, but content extraction failed.")
                         break # Found the latest assistant message
                else:
                    assistant_response = "Assistant responded, but the message content was empty."
                    break # Found an empty assistant message

        logger.debug(f"User message: {user_message}")
        logger.debug(f"File ID: {file_id}")
        logger.debug(f"AI response: {assistant_response}")

        return JsonResponse({'response': assistant_response})

    except Exception as e:
        logger.error(f"Error in agent chat: {e}")
        return JsonResponse({'error': str(e)}, status=500)

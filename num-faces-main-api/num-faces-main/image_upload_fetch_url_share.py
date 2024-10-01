from flask import Flask, request, jsonify
from PIL import Image
from flask_cors import CORS
import boto3
import io,os
# from dotenv import load_dotenv

app = Flask(__name__)
CORS(app) 
# load_dotenv()

def create_s3():
    s3 = boto3.resource(
        service_name='s3',
        region_name='ap-south-1',
        

    )
    return s3

@app.route("/im_size", methods=["POST"])
def process_image():
    files = request.files.getlist('image')
    Urls_list=[]
    file_names_list = []
    s3 = create_s3()

    # Read the image via file.stream
    for file in files:
        img = Image.open(file.stream)

        # Convert the image to a file-like object
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=img.format)
        img_byte_arr.seek(0)


        bucket_name = 'photo-upload-face-recognition'
        file_name = file.filename

        s3.Bucket(bucket_name).upload_fileobj(img_byte_arr, file_name)
        s3_file_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
        file_names_list.append(file_name)
        Urls_list.append(s3_file_url)

    return jsonify({'msg': 'success', 'file_names': file_names_list,'s3_url_list':Urls_list})

if __name__ == "__main__":
    app.run(debug=True,port=5004)

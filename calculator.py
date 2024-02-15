from flask import Flask, request, jsonify
import pika
import uuid
import redis
import json

app = Flask(__name__)

# Initialize Redis connection
r = redis.Redis(host='localhost', port=6379, db=0)

def perform_calculation(operands, operator):
    if operator == "add":
        return sum(operands)
    elif operator == "subtract":
        return operands[0] - operands[1]
    elif operator == "multiply":
        result = 1
        for num in operands:
            result *= num
        return result
    elif operator == "divide":
        return operands[0] / operands[1] if operands[1] != 0 else "Erreur"

@app.route('/api', methods=['GET'])
def get_dic():
    # It's not a good practice to return all keys in Redis like this in production
    return jsonify({key: r.get(key) for key in r.keys()})

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    calc_id = str(uuid.uuid4())
    data['calc_id'] = calc_id

    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    # Declare a queue
    channel.queue_declare(queue='calc_queue')

    # Publish message to the queue
    channel.basic_publish(exchange='', routing_key='calc_queue', body=json.dumps(data))

    connection.close()

    return jsonify({"calc_id": calc_id})


@app.route('/api/result/<calc_id>', methods=['GET'])
def get_result(calc_id):
    result = r.get(calc_id)
    if result is None:
        return jsonify(error="Result not found"), 404
    # Convert result from bytes to string
    return jsonify(result=result.decode('utf-8'))

if __name__ == '__main__':
    app.run(debug=True)

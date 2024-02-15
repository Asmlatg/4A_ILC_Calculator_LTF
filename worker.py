import pika
import json
from calculator import perform_calculation, r  # Import the perform_calculation function and Redis instance

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='calc_queue')

def callback(ch, method, properties, body):
    data = json.loads(body)
    operator = data['operator']
    operands = data['operands']
    calc_id = data['calc_id']

    result = perform_calculation(operands, operator)
    r.set(calc_id, result)

channel.basic_consume(queue='calc_queue', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()

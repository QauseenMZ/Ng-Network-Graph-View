# Network Graph - AngularJS (7.0.2)

Basic app that accepts a string object and generates corresponding network graph. Graphs are being generated by Angular D3.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Developer - Qauseen Maab 
Developed as interview assessment for OpenNMS.

## Test Input JSON
Can use any JSON object string of following pattern. I've used following for testing the results:
{
    "vertices": [{
        "id": "n1",
        "label": "Node 1",
        "type": "node"
        },
        {
        "id": "n2",
        "label": "Node 2",
        "type": "node"
        },
        {
        "id": "a1",
        "label": "Alarm 1",
        "type": "alarm"
        },
        {
        "id": "a2",
        "label": "Alarm 2",
        "type": "alarm"
        },
    ],
    "edges": [{
        "id": "e1",
        "label": "edge n1-n2",
        "type": "link",
        "source_id": "n1",
        "target_id": "n2"
    },
    {
        "id": "e2",
        "label": "edge n2-a1",
        "type": "link",
        "source_id": "n2",
        "target_id": "a1"
    },
    {
        "id": "e3",
        "label": "edge n2-a2",
        "type": "link",
        "source_id": "n2",
        "target_id": "a2"
    }
    ]
}
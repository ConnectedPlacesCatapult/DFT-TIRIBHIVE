"""Script to save TRIB-Roadmap JSON data to data/roadmap/"""
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
ROADMAP_DIR = os.path.join(BASE, "data", "roadmap")
os.makedirs(ROADMAP_DIR, exist_ok=True)

# CaseStudiesContent.json
CaseStudiesContent = {
  "Case_Studies": [
    {"title": "Network Capacity Management", "body": [
      "This case study, part of the Department for Transport's Integrated Network Management Digital Twin (IN-DT) Economic Benefits Analysis, explores how federated digital twins can transform network capacity management across Britain's transport systems.",
      "Key steps involve creating shared data architectures, decision support tools, and phased pilots."
    ]},
    {"title": "Multimodal Journey Optimisation", "body": [
      "This case study examines the use of digital twin technology for optimising multimodal journeys.",
      "Estimated at £110.9 million in benefits over 10 years."
    ]},
    {"title": "Integrated Incident and Emergency Management", "body": ["Text1", "Text2"]},
    {"title": "Planned Works & Maintenance Management", "body": ["Text1", "Text2"]},
    {"title": "Freight Management at Ports", "body": ["Text1", "Text2"]},
    {"title": "Next-Generation / Cross-Cutting Digital Twin Innovations", "body": ["Text1", "Text2"]},
    {"title": "Alchera Data Technologies Ltd", "body": ["Text1", "Text2"]},
    {"title": "Didimi Ltd", "body": ["Text1", "Text2"]},
    {"title": "GPC Systems' Forklift Measure", "body": ["Text1", "Text2"]},
  ]
}

# Stakeholders.json
Stakeholders = {
  "Stakeholders": [
    "3Mile", "Active Travel England", "Aerospace Technology Institute", "AGS", "Aimsun",
    "Alan Turing Institute", "Arup", "BIM academy", "Centre for Connected and Autonomous Vehicles",
    "Connected Places Catapult", "CPNI", "Cranfield University", "CReDo", "Cyber Hawk", "DAFNI",
    "DCMS", "Department for Business and Trade", "Department for Infrastructure NI",
    "Department for Transport", "Department for Science, Innovation and Technology", "DfT",
    "Digital Catapult", "DT Hub Strategic Board", "Energy Systems Catapult", "EPSRC",
    "Gatwick Airport", "Geospatial Commission", "ADEPT", "Hitachi", "HM Treasury", "HS1", "HS2",
    "High Value Manufacturing Catapult", "I3P Industry supply chain group", "Immense Simulations",
    "Imperial College London", "Infrastructure Client Group", "Institute for Transport studies",
    "Innovate UK", "JAG(UK)", "KPMG", "Leeds Institute for Data Analytics",
    "Maritime and Coast Guard Agency", "Maritrace", "National Grid", "National Highways", "NATS",
    "Network Rail", "Nicander", "North Northamptonshire council", "Openspace", "Ordinance Survey",
    "Oxfordshire County Council", "Pinsent Masons", "Pixel Mill", "Port of Tyne",
    "Rail Safety and Standards Board", "Rail Delivery Group", "Searidge", "STFC", "Strategic Ventures TRL",
    "Strathclyde University", "TfGM", "Transport for London", "Transport for West Midlands",
    "Transport Scotland", "Transport Wales", "TRL", "UKCRIC", "University of Birmingham",
    "University of Bristol", "University of Cambridge", "University of Liverpool", "Welsh Government",
    "WMG University of Warwick"
  ]
}

# UseCaseContent.json
UseCaseContent = {
  "Use_Cases": [
    {"title": "Passenger movement and behaviour digital twin", "body": ["Text1", "Text2"]},
    {"title": "Electric chargers for heavy goods vehicles", "body": ["Text1", "Text2"]},
    {"title": "EV charging infrastructure for shared autonomous vehicles", "body": ["Text1", "Text2"]},
    {"title": "Changes to highway network in urban areas", "body": ["Text1", "Text2"]},
    {"title": "Air pollution monitoring from road traffic", "body": ["Text1", "Text2"]},
    {"title": "Underground freight transport system", "body": ["Text1", "Text2"]},
  ]
}

# Lit Review - minimal
LitReview = [
  {"Name": "Gemini Principles", "Source": "https://www.cdbb.cam.ac.uk/system/files/documents/TheGeminiPrinciples.pdf", "Author": "CDBB", "Publication date": "2018-12", "Description": "Founding principles for national digital twin"}
]

files = [
    ("CaseStudiesContent.json", CaseStudiesContent),
    ("Stakeholders.json", Stakeholders),
    ("UseCaseContent.json", UseCaseContent),
    ("Lit Review.json", LitReview),
]

for filename, data in files:
    path = os.path.join(ROADMAP_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {filename}")

print("Done.")

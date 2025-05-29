import json

def format_conditionals(conditions, conditional_text):
    output = ""
    conditions = conditions or []
    conditional_text = conditional_text or {}

    for condition in conditions:
        if condition in conditional_text:
            output += f"  - (If {condition}): {conditional_text[condition]}\n"
    for condition, text in conditional_text.items():
        if condition not in conditions:
            output += f"  - (If {condition}): {text}\n"

    return output


def format_choices(choices):
    if not choices:
        return ""
    output = "  > Choices:\n"
    for choice in choices:
        line = f"    - {choice['text']}"
        if "requiresCondition" in choice:
            line += f" (requires: {choice['requiresCondition']})"
        if "nextEvent" in choice:
            line += f" → {choice['nextEvent']}"
        output += line + "\n"
    return output

def parse_event(event):
    output = [f"\n--- {event['title']} [{event['key']}] ---\n"]
    dialogs = event.get("preDialog", []) + event.get("postDialog", [])
    for dialog in dialogs:
        if dialog.get("background"):
            output.append(f"[Scene: {dialog['background']}]")

        speaker = dialog.get("speaker", "Unknown")
        text = dialog.get("text", "")
        output.append(f"{speaker}: {text}")

        conditions = dialog.get("conditions")
        conditional_text = dialog.get("conditionalText")
        output.append(format_conditionals(conditions, conditional_text))

        choices = dialog.get("choices")
        output.append(format_choices(choices))
    return "\n".join(filter(None, output))

def parse_entire_story(json_data):
    all_output = []
    for event in json_data["events"]:
        all_output.append(parse_event(event))
    return "\n".join(all_output)

if __name__ == "__main__":
    with open("../src/data/gameData.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    result = parse_entire_story(data)

    with open("readable_story.txt", "w", encoding="utf-8") as out:
        out.write(result)

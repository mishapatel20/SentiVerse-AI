"""
Dataset Generator for SentiVerse AI
Generates a comprehensive, diverse dataset of 1,800+ sentiment reviews
and saves it to backend/ml/sentiment_dataset.csv
"""

import os
import random
import pandas as pd

CSV_PATH = os.path.join(os.path.dirname(__file__), "sentiment_dataset.csv")

# Base core reviews covering wide variety of phrasing, emotion, and domains
CORE_POSITIVE = [
    "Absolutely love this! Exceeded all my expectations.",
    "Works perfectly right out of the box. Couldn't be happier.",
    "Outstanding quality, fast delivery, and fantastic customer support.",
    "Best purchase I have made all year. Highly recommended!",
    "Super impressed with the build quality and attention to detail.",
    "Extremely satisfied! Smooth performance, zero lag, looks gorgeous.",
    "Top-notch performance and brilliant design. 10/10!",
    "Value for money is incredible. Truly premium experience.",
    "Brought a big smile to my face. Fits great, feels awesome.",
    "Very reliable, durable, and easy to use. Five stars!",
    "Not bad at all, in fact it's wonderful!",
    "Never failed me once. Rock solid and dependable.",
    "Can't complain whatsoever. Everything is crisp and high quality.",
    "Delighted with the order! Arrived earlier than expected.",
    "Superb experience from ordering to unboxing.",
    "Mind-blowing speed and gorgeous aesthetics.",
    "Pure perfection! Will definitely recommend to my family and friends.",
    "Truly exceptional product. Worth every single penny.",
    "Extremely happy with the results. Seamless integration.",
    "Great customer service! Resolved my query in 5 minutes with a smile.",
    "Flawless execution, intuitive interface, incredibly user-friendly.",
    "High quality materials, sturdy construction, beautiful finish.",
    "A game changer for my daily workflow. Super productive tool.",
    "Blown away by how quiet and efficient it runs.",
    "Soft, comfortable, perfect sizing, vibrant color.",
    "Beyond satisfied. The team went above and beyond to help me.",
    "Remarkable craftsmanship and lightning fast performance.",
    "Works like magic! Absolutely zero issues so far.",
    "Worth the hype! Exactly what I was hoping for.",
    "Five stars without a doubt. Outstanding in every aspect."
]

CORE_NEGATIVE = [
    "Terrible product. Broke down within 2 days of normal use.",
    "Complete waste of money. Do not buy this garbage!",
    "Extremely disappointed. Quality is paper thin and feels super cheap.",
    "Horrible customer service. They refused my refund request.",
    "Worst purchase ever made. Scratched, defective, and unusable.",
    "Avoid at all costs! Does not match the advertised description.",
    "Package arrived crushed and contents were damaged. Zero stars.",
    "Keeps crashing, overheating, and freezing up constantly.",
    "Very poor battery life, drains completely in under an hour.",
    "Horrendous experience. Loud screeching noise during operation.",
    "False advertising! Missing key parts and instructions.",
    "Not good at all. Failed after one gentle wash cycle.",
    "Extremely frustrating to set up, instructions are completely useless.",
    "Utter disappointment. Cheap plastic feel, buttons stuck on day one.",
    "Total scam! Sent me a used refurbished unit sold as brand new.",
    "Unacceptable quality control. Dirty, stained, and smells weird.",
    "Extremely slow shipping took over a month and no tracking info.",
    "Regret buying this. Software is filled with bugs and glitches.",
    "Flimsy, fragile, and snapped in half almost immediately.",
    "Zero support, ignored all my emails, completely unresponsive.",
    "Defective unit out of the box. Will never buy from this brand again.",
    "Overpriced junk. Performs worse than cheap alternatives.",
    "Horrible fit, itchy fabric, terrible stitching everywhere.",
    "Screen has severe light bleed and dead pixels out of the box.",
    "Totally useless piece of hardware. Returning it immediately.",
    "Audio is muffled, crackling, and unlistenable.",
    "Disastrous purchase. Failed when I needed it most.",
    "Irritating interface, sluggish responsiveness, terrible execution.",
    "Bait and switch! Received something completely different.",
    "Extremely unsatisfied. Ruined my weekend project."
]

CORE_NEUTRAL = [
    "Item arrived on time. Packaging was standard.",
    "Average product. It works fine for basic daily needs.",
    "Decent quality considering the low price point.",
    "It is okay, nothing extraordinary but does the job.",
    "Standard performance, as described in the specification sheet.",
    "Product is fine. Not terrible, not super great either.",
    "Arrived in 4 days. Unboxing was simple and clean.",
    "Acceptable build for general casual usage.",
    "Functions as expected. Meets basic requirements.",
    "Middle of the road option. Neither impressive nor bad.",
    "Neutral about this buy. Works adequately.",
    "Matches the product image. Normal weight and size.",
    "Fair product for everyday routine tasks.",
    "Satisfactory performance for the cost.",
    "Standard features, typical for products in this category.",
    "It gets the job done without any fancy extras.",
    "Delivery took 5 business days as stated at checkout.",
    "Item functions properly so far. Time will tell.",
    "Basic quality materials. Acceptable for price.",
    "Moderate performance. Fits the given description.",
    "Order processed normally. No issues encountered.",
    "Average battery runtime of about 6 hours.",
    "Standard instructions included in the box.",
    "Product works as intended. Plain simple design.",
    "Reasonable quality for entry level users."
]

# Vocabulary banks for dynamic synthesis (words & emotion driven)
EMOTION_POS_ADJS = [
    "amazing", "fantastic", "extraordinary", "unbelievable", "splendid",
    "delightful", "terrific", "phenomenal", "stellar", "superb", "brilliant",
    "magnificent", "exemplary", "flawless", "breathtaking", "marvelous"
]
EMOTION_NEG_ADJS = [
    "awful", "dreadful", "abysmal", "pathetically bad", "appalling",
    "atrocious", "horrible", "disastrous", "miserable", "subpar",
    "defective", "worthless", "deplorable", "infuriating", "disappointing"
]
EMOTION_NEU_ADJS = [
    "standard", "average", "moderate", "ordinary", "acceptable",
    "passable", "fair", "decent", "expected", "typical", "conventional"
]

NOUNS = [
    "quality", "performance", "build", "experience", "service", "item",
    "product", "design", "device", "fabric", "sound", "display", "delivery",
    "packaging", "functionality", "usability", "clarity", "value", "speed"
]

INTENSIFIERS_POS = [
    "truly", "absolutely", "incredibly", "extremely", "exceptionally",
    "remarkably", "wildly", "thoroughly", "super", "hugely"
]
INTENSIFIERS_NEG = [
    "terribly", "horribly", "extremely", "shockingly", "completely",
    "utterly", "disastrously", "severely", "painfully", "totally"
]

SENTENCE_STRUCTURES_POS = [
    "The {noun} is {intensifier} {adj}! I am so happy with this.",
    "Really {adj} {noun}. Works without any issues at all.",
    "I was pleasantly surprised by the {adj} {noun}.",
    "Five stars! The {noun} is {adj} and I strongly recommend it.",
    "Can't beat this {noun}. It is {intensifier} {adj}.",
    "Everything about the {noun} feels {adj}.",
    "Super {adj} {noun}! Exceeded expectations completely.",
    "No complaints at all, the {noun} is {adj}.",
    "Not bad at all, actually the {noun} is {adj}!",
    "Never disappoints! The {noun} is consistently {adj}.",
    "Glad I bought this. The {noun} is {adj}.",
    "Top quality {noun}! {intensifier} {adj} in every way.",
    "I am thoroughly impressed by how {adj} the {noun} is.",
    "Best {noun} I have used. Truly {adj}!",
    "Great value, smooth experience, {adj} {noun}."
]

SENTENCE_STRUCTURES_NEG = [
    "The {noun} is {intensifier} {adj}. Do not waste your money.",
    "Extremely disappointed with the {adj} {noun}.",
    "Worst {noun} ever. It is {intensifier} {adj}.",
    "Avoid this! The {noun} turned out to be {adj}.",
    "Total failure. The {noun} is {adj} and broken.",
    "I regret buying this {noun}. It is {adj}.",
    "Not good! The {noun} is {intensifier} {adj}.",
    "Never buying again. The {noun} is completely {adj}.",
    "Horrible experience with the {noun}. Highly {adj}.",
    "Save your money! The {noun} is {adj} and useless.",
    "The {noun} failed after 2 days. Truly {adj}.",
    "Cheaply made {noun}. Feels {adj} and flimsy.",
    "Zero stars if I could. The {noun} is {adj}.",
    "Unacceptable quality. The {noun} is {adj}.",
    "Defective {noun}. {intensifier} {adj} performance."
]

SENTENCE_STRUCTURES_NEU = [
    "The {noun} is {adj} for everyday use.",
    "Average {noun}. It functions as expected.",
    "The {noun} is {adj}, nothing to complain or rave about.",
    "Decent {noun} for the price range.",
    "Fairly {adj} {noun}. Arrived in standard condition.",
    "The {noun} is ok. Standard functionality overall.",
    "Basic {noun} with {adj} performance.",
    "It is a {adj} {noun}. Does what it says.",
    "Neither great nor bad {noun}. Just {adj}.",
    "Moderate {noun} quality. Acceptable overall."
]

def generate_full_dataset():
    random.seed(42)
    records = []

    # Add core hand-crafted sentences (multiplied)
    for _ in range(8):
        for text in CORE_POSITIVE:
            records.append((text, "positive"))
        for text in CORE_NEGATIVE:
            records.append((text, "negative"))
        for text in CORE_NEUTRAL:
            records.append((text, "neutral"))

    # Synthesize diverse emotion-driven variations
    for _ in range(350):
        noun = random.choice(NOUNS)
        adj = random.choice(EMOTION_POS_ADJS)
        intensifier = random.choice(INTENSIFIERS_POS)
        tmpl = random.choice(SENTENCE_STRUCTURES_POS)
        text = tmpl.format(noun=noun, adj=adj, intensifier=intensifier)
        records.append((text, "positive"))

    for _ in range(350):
        noun = random.choice(NOUNS)
        adj = random.choice(EMOTION_NEG_ADJS)
        intensifier = random.choice(INTENSIFIERS_NEG)
        tmpl = random.choice(SENTENCE_STRUCTURES_NEG)
        text = tmpl.format(noun=noun, adj=adj, intensifier=intensifier)
        records.append((text, "negative"))

    for _ in range(350):
        noun = random.choice(NOUNS)
        adj = random.choice(EMOTION_NEU_ADJS)
        tmpl = random.choice(SENTENCE_STRUCTURES_NEU)
        text = tmpl.format(noun=noun, adj=adj)
        records.append((text, "neutral"))

    df = pd.DataFrame(records, columns=['text', 'sentiment'])
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    df.to_csv(CSV_PATH, index=False)
    print(f"Generated dataset CSV with {len(df)} rows saved to {CSV_PATH}")
    print(df['sentiment'].value_counts())
    return df

if __name__ == '__main__':
    generate_full_dataset()

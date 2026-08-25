from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "DLS_Bathrooms_Terms_DRAFT_Solicitor_Review.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#101315")
GOLD = colors.HexColor("#C49B50")
PALE_GOLD = colors.HexColor("#F4E8C8")
STONE = colors.HexColor("#625F57")
LINE = colors.HexColor("#D8D2C5")
PAPER = colors.HexColor("#FCFBF7")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleDLS", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=30, leading=33, textColor=INK, spaceAfter=10, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="SubtitleDLS", parent=styles["Normal"], fontName="Helvetica", fontSize=12, leading=18, textColor=STONE, spaceAfter=16))
styles.add(ParagraphStyle(name="EyebrowDLS", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=GOLD, tracking=1.4, spaceAfter=8))
styles.add(ParagraphStyle(name="H1DLS", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=INK, spaceBefore=2, spaceAfter=10))
styles.add(ParagraphStyle(name="H2DLS", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=INK, spaceBefore=9, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyDLS", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=14.2, textColor=STONE, spaceAfter=7))
styles.add(ParagraphStyle(name="BodySmallDLS", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=12, textColor=STONE, spaceAfter=5))
styles.add(ParagraphStyle(name="CalloutDLS", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.4, leading=14.5, textColor=INK, backColor=PALE_GOLD, borderColor=GOLD, borderWidth=0.6, borderPadding=10, spaceBefore=4, spaceAfter=14))
styles.add(ParagraphStyle(name="CenterSmallDLS", parent=styles["BodySmallDLS"], alignment=TA_CENTER))


def p(text, style="BodyDLS"):
    return Paragraph(text, styles[style])


def clause(number, title, paragraphs):
    parts = [p(f"{number}. {title}", "H2DLS")]
    parts.extend(p(item) for item in paragraphs)
    return KeepTogether(parts)


def draw_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(20 * mm, PAGE_H - 15 * mm, PAGE_W - 20 * mm, PAGE_H - 15 * mm)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(20 * mm, PAGE_H - 11.5 * mm, "DLS BATHROOMS LTD")
    canvas.setFillColor(STONE)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#A11B1B"))
    canvas.drawRightString(PAGE_W - 20 * mm, PAGE_H - 11.5 * mm, "DRAFT FOR SOLICITOR REVIEW - DO NOT ISSUE")
    canvas.line(20 * mm, 15 * mm, PAGE_W - 20 * mm, 15 * mm)
    canvas.drawString(20 * mm, 10.5 * mm, "Company No. 17412702  |  info@dlsbathrooms.co.uk  |  07539 037841")
    canvas.drawRightString(PAGE_W - 20 * mm, 10.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=20 * mm,
    leftMargin=20 * mm,
    topMargin=22 * mm,
    bottomMargin=21 * mm,
    title="DLS Bathrooms Ltd Customer Terms and Conditions",
    author="DLS Bathrooms Ltd",
    subject="Draft customer terms for solicitor review - not for issue",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates(PageTemplate(id="dls", frames=[frame], onPage=draw_header_footer))

story = []
story.extend([
    Spacer(1, 12 * mm),
    p("DRAFT FOR SOLICITOR REVIEW - DO NOT ISSUE", "EyebrowDLS"),
    p("Customer Terms<br/>and Conditions", "TitleDLS"),
    p("For bathroom renovations, wet rooms, tiling, plumbing and related installation work.", "SubtitleDLS"),
    HRFlowable(width="100%", thickness=1.1, color=GOLD, spaceBefore=4, spaceAfter=18),
    p("Review draft - 25 August 2026", "H2DLS"),
    p("These terms are intended to be read with the written quotation, specification, drawings, accepted variations and any cancellation information supplied for the project. If a project document conflicts with these general terms, the written quotation or later written variation takes priority for that project.", "CalloutDLS"),
])

details = [
    [p("BUSINESS", "EyebrowDLS"), p("DLS Bathrooms Ltd", "BodyDLS")],
    [p("COMPANY NUMBER", "EyebrowDLS"), p("17412702 - registered in England and Wales", "BodyDLS")],
    [p("REGISTERED OFFICE", "EyebrowDLS"), p("28-30 Wilbraham Road, Manchester, M14 7DW, England", "BodyDLS")],
    [p("CONTACT", "EyebrowDLS"), p("info@dlsbathrooms.co.uk  |  07539 037841", "BodyDLS")],
]
table = Table(details, colWidths=[42 * mm, 118 * mm], hAlign="LEFT")
table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.extend([table, Spacer(1, 15 * mm), p("IMPORTANT CUSTOMER INFORMATION", "EyebrowDLS"), p("Nothing in these terms limits rights that cannot legally be excluded. Consumer services must be performed with reasonable care and skill. Depending on how and where the contract is agreed, statutory cancellation rights may apply; the cancellation notice and model form at the end of this document explain the general position.", "BodyDLS"), PageBreak()])

story.extend([
    p("The agreement", "H1DLS"),
    clause(1, "Contract documents and priority", [
        "The contract is made up of the accepted written quotation, these terms, the agreed specification or drawings, written product schedules and any later written variation. The quotation identifies the customer, property, scope, price and payment schedule.",
        "Marketing material, conversations and remote estimates are not part of the final contract unless repeated or confirmed in the accepted quotation. Information that the law treats as binding remains binding.",
    ]),
    clause(2, "Quotation validity and acceptance", [
        "A quotation is valid for the period stated on it. It may be withdrawn before acceptance. A contract is formed only when DLS confirms acceptance in writing after the customer accepts the quotation and completes any required booking steps.",
        "Prices include VAT only if the quotation says so. Any allowance, provisional sum or customer selection still to be confirmed will be identified in the quotation.",
    ]),
    clause(3, "Remote estimates and customer information", [
        "A remote or video estimate is based on the photographs, video, measurements, product information and description supplied. It is a planning figure, not a final quotation, unless DLS clearly confirms otherwise in writing.",
        "The customer must take reasonable care to make the information complete and accurate. DLS may revise the figure, request more information or require a site visit if the actual room, access, measurements, products or scope differ.",
    ]),
    clause(4, "DLS responsibilities", [
        "DLS will perform the agreed service with reasonable care and skill, coordinate the work described in the quotation, keep the customer reasonably informed and comply with applicable legal requirements.",
        "Where specialist certification, approval or a third-party service is included, the quotation will identify it or explain how it will be arranged.",
    ]),
    clause(5, "Customer responsibilities", [
        "The customer must have authority to instruct the work, provide accurate information, make decisions and product selections by the agreed dates, obtain any permission for which the quotation makes the customer responsible, and pay in accordance with the agreed schedule.",
        "The customer must tell DLS about known leaks, asbestos concerns, structural movement, unsafe wiring, access restrictions, parking controls and other material risks before work starts.",
    ]),
    clause(6, "Access, utilities and working space", [
        "The customer must provide safe and reasonable access on the agreed working days, working water and electricity, and reasonable space for tools, materials and waste. Personal belongings should be removed from the bathroom and agreed access route.",
        "If access or essential utilities are unavailable, DLS may pause work and recover reasonable evidenced cost caused by the delay, after discussing the issue with the customer.",
    ]),
    PageBreak(),
    p("Scope, products and changes", "H1DLS"),
    clause(7, "Scope and exclusions", [
        "Only the work listed in the accepted quotation is included. Items described as excluded, customer-supplied, provisional or subject to inspection are not fixed-price inclusions unless later confirmed in writing.",
        "Decorating, structural work, asbestos work, external services, approvals and making good outside the agreed area are excluded unless the quotation states otherwise.",
    ]),
    clause(8, "Variations and additional work", [
        "A request or discovery that changes the agreed work is a variation. Wherever practical, DLS will describe the change, price and likely effect on timing in writing before carrying it out. Email and the agreed project messaging channel count as writing.",
        "If urgent action is reasonably required to make the property safe or prevent damage, DLS may take proportionate protective action and will inform the customer as soon as reasonably possible.",
    ]),
    clause(9, "Hidden and unforeseen conditions", [
        "Strip-out may reveal conditions that could not reasonably be identified beforehand, including damaged pipework, unsafe wiring, rotten timber, failed substrates, moisture, structural movement or suspected asbestos.",
        "DLS will explain the issue and may pause affected work while options, additional cost and programme changes are agreed. DLS will not disturb suspected asbestos and may require a specialist assessment.",
    ]),
    clause(10, "Products supplied by DLS", [
        "Where DLS supplies products, the quotation will identify the product or allowance. Reasonable equivalent substitutions will be discussed if an item becomes unavailable. The customer must approve any material change in product or price.",
        "Manufacturer instructions and care requirements form part of the product information. Natural materials, tiles and finishes may show reasonable variations in shade, grain, texture or batch.",
    ]),
    clause(11, "Customer-supplied products", [
        "The customer is responsible for ordering suitable products in the correct quantity and making them available by the agreed date. DLS is not responsible for the quality, compatibility, condition, completeness, delivery or manufacturer support of customer-supplied products.",
        "Reasonable additional work, delay or return visits caused by missing, late, damaged or unsuitable customer-supplied products may be charged as a variation. DLS will not install a product it reasonably considers unsafe or unsuitable.",
    ]),
    clause(12, "Deliveries, storage and care", [
        "Delivery arrangements and responsibility for storage will follow the quotation. The customer must provide reasonable secure space where customer storage is agreed. DLS will take reasonable care of the property and products while they are under its control.",
    ]),
    PageBreak(),
    p("Price, timing and completion", "H1DLS"),
    clause(13, "Price, deposit and stage payments", [
        "The total price, booking deposit and stage-payment schedule are stated in the quotation. The schedule may differ between labour-only and supply-and-fit projects and may include payments before major product orders or agreed stages.",
        "Where offered, payment may be made by bank transfer or by consumer debit or credit card processed through Worldpay. DLS does not provide credit. The accepted quotation and invoice will state the available method and due date.",
        "Invoices are due on the dates or milestones stated. If the customer disputes an amount, they should explain why promptly and pay any undisputed amount when due. DLS must be given a reasonable opportunity to answer the concern.",
    ]),
    clause(14, "Non-payment and suspension", [
        "If an undisputed payment is overdue, DLS may give written notice and pause ordering or work until it is paid. DLS will act reasonably and explain any likely effect on the programme. Reasonable, evidenced cost caused by a customer payment default may be recoverable where lawful and fair.",
    ]),
    clause(15, "Start dates and programme", [
        "Proposed start and completion dates are given in good faith. Unless the quotation makes a date expressly binding, timing is an estimate based on the information and availability known when the quotation is accepted.",
        "DLS will communicate material changes. The programme may reasonably change because of variations, hidden conditions, customer decisions, product availability, utility failures, severe weather, illness, access problems or matters outside DLS control.",
    ]),
    clause(16, "Protection, cleaning and waste", [
        "DLS will take reasonable precautions in the agreed working and access areas. Bathroom renovation is dusty and noisy; the customer should protect or remove vulnerable possessions elsewhere in the property.",
        "Waste removal and final cleaning are included only to the extent described in the quotation. The customer must not place unrelated waste in a DLS skip or waste area without agreement.",
    ]),
    clause(17, "Practical completion and snagging", [
        "Practical completion means the agreed work is substantially complete and the bathroom can be used for its intended purpose, apart from minor items that do not prevent normal use.",
        "The customer should report visible snagging promptly, ideally within 14 days. DLS will inspect and, where responsible, correct it within a reasonable time. Reporting within 14 days helps administration but is not a deadline that removes statutory rights.",
    ]),
    clause(18, "Workmanship guarantee", [
        "DLS provides a 24-month workmanship guarantee from practical completion. It covers faults caused by DLS workmanship. DLS must be told promptly and given a reasonable opportunity to inspect and remedy a covered fault.",
        "The guarantee does not cover normal wear, accidental damage, misuse, inadequate maintenance or ventilation, product defects, building movement, customer-supplied products, pre-existing defects or work altered by someone else. These exclusions do not remove statutory rights.",
    ]),
    clause(19, "Manufacturer warranties", [
        "Products may have separate manufacturer warranties subject to their terms. DLS will provide available product information and reasonable assistance, but a manufacturer warranty is separate from the DLS workmanship guarantee and statutory rights.",
    ]),
    Spacer(1, 5 * mm),
    HRFlowable(width="100%", thickness=0.7, color=GOLD, spaceAfter=12),
    p("Cancellation, records and disputes", "H1DLS"),
    clause(20, "Statutory cancellation rights", [
        "If the contract is made at a distance or away from DLS business premises, the Consumer Contracts Regulations may provide a right to cancel without giving a reason. The applicable deadline depends on the type of contract and how goods and services are supplied. DLS will provide the cancellation information that applies to the accepted quotation.",
        "For a service contract, the normal cancellation period ends 14 days after the day the contract is entered into. A customer may cancel using the model form in this document or any other clear statement sent before the deadline.",
    ]),
    clause(21, "Work requested during a cancellation period", [
        "DLS will not begin a service during an applicable cancellation period unless the customer makes an express request. For an off-premises contract, that request must be made on a durable medium.",
        "If the customer cancels after expressly requesting an early start, the customer may have to pay a proportionate amount for service supplied up to cancellation. Once a service is fully performed after the required request and acknowledgement, the statutory right to cancel that service may end. The early-start request section is provided at the end of this document.",
    ]),
    clause(22, "Cancellation outside statutory rights and termination", [
        "Outside any statutory cancellation right, either party may end the contract where the other commits a serious breach and does not remedy it within a reasonable period after written notice. DLS may also stop for serious safety concerns or continued non-payment of an undisputed amount.",
        "On cancellation or termination, the customer must pay amounts properly due for work completed, approved products ordered and reasonable unavoidable commitments, subject to statutory rights and the duty to keep loss reasonable. DLS will account for sums already paid.",
    ]),
    clause(23, "Photographs and personal information", [
        "DLS may take progress photographs for project records, quality control and resolving questions. Portfolio or marketing use will be discussed with the customer. Addresses and identifying personal details will not be published without permission.",
        "Personal information is handled as described in the DLS privacy policy at www.dlsbathrooms.co.uk/privacy.",
    ]),
    clause(24, "Concerns, liability, rights and law", [
        "Please raise concerns promptly so DLS can inspect and propose a solution. Contact info@dlsbathrooms.co.uk or 07539 037841. Both parties should try to resolve a dispute reasonably before court proceedings.",
        "Nothing excludes liability where it would be unlawful to do so. Nothing limits statutory rights, including the right to services performed with reasonable care and skill. The contract is governed by the law of England and Wales and the courts with lawful jurisdiction may hear disputes.",
    ]),
    PageBreak(),
    p("Cancellation information", "H1DLS"),
    p("This page gives general cancellation information for a consumer service contract agreed at a distance or away from DLS business premises. The accepted quotation should confirm the position for the particular supply-and-fit or labour-only arrangement."),
    p("RIGHT TO CANCEL", "EyebrowDLS"),
    p("Where the statutory right applies to a service contract, you may cancel within 14 days after the day the contract is entered into without giving a reason. To meet the deadline, send a clear cancellation statement before the period ends. You may use the model form on the next page, but you do not have to."),
    p("EFFECT OF CANCELLATION", "EyebrowDLS"),
    p("DLS will reimburse payments as required by law, normally without undue delay and within the applicable statutory time. If you expressly asked DLS to begin a service during the cancellation period, you may be required to pay a proportionate amount for service supplied up to the time you cancel."),
    p("HOW TO CONTACT DLS", "EyebrowDLS"),
    p("Email: info@dlsbathrooms.co.uk<br/>Post: DLS Bathrooms Ltd, 28-30 Wilbraham Road, Manchester, M14 7DW, England<br/>Telephone: 07539 037841"),
    Spacer(1, 7 * mm),
    p("REQUEST TO START DURING THE CANCELLATION PERIOD", "H2DLS"),
    p("Complete this only if you want DLS to begin the service before an applicable cancellation period has ended.", "BodySmallDLS"),
    p("[  ] I expressly request DLS Bathrooms Ltd to begin the agreed service before the end of the cancellation period. I understand that, if I cancel after work has started, I may have to pay a proportionate amount for the service supplied up to cancellation. I also understand that, if the service is fully performed following my request and acknowledgement, I may lose the right to cancel that service."),
    Spacer(1, 7 * mm),
    p("Customer name: _______________________________________________"),
    p("Project address: ______________________________________________"),
    p("Signature: ___________________________________   Date: __________________"),
    PageBreak(),
    p("Model cancellation form", "H1DLS"),
    p("Complete and return this form only if you wish to cancel. You may instead send any other clear statement that you have decided to cancel.", "CalloutDLS"),
    p("To: DLS Bathrooms Ltd<br/>28-30 Wilbraham Road<br/>Manchester<br/>M14 7DW<br/>England<br/>info@dlsbathrooms.co.uk"),
    Spacer(1, 5 * mm),
    p("I/We give notice that I/We cancel my/our contract for the supply of the following service or goods:"),
    p("________________________________________________________________________"),
    p("________________________________________________________________________"),
    p("Ordered on / contract agreed on: __________________________________________"),
    p("Name of customer(s): ____________________________________________________"),
    p("Address of customer(s): _________________________________________________"),
    p("________________________________________________________________________"),
    p("Signature of customer(s), if this form is sent on paper:"),
    p("________________________________________________________________________"),
    p("Date: __________________________________________________________________"),
    Spacer(1, 12 * mm),
    HRFlowable(width="100%", thickness=0.8, color=GOLD, spaceAfter=10),
    p("PROJECT ACCEPTANCE RECORD", "H2DLS"),
    p("Quotation reference: ____________________   Project address: ______________________________"),
    p("Customer name: _________________________   Accepted on: _________________________________"),
    p("These fields are for project administration. Acceptance should follow the method stated in the quotation."),
])

doc.build(story)
print(OUTPUT)

import { useState } from "react";

const items = [
  {
    title: "OpenClaw Gateway",
    desc: "Terminal-based system with real-time logs.",
    image: "/image.png",
  },
  {
    title: "Django API",
    desc: "Scalable backend APIs with auth.",
    image: "/img1.jpg",
  },
  {
    title: "Automation Tool",
    desc: "Python scripts to reduce manual work.",
    image: "/img2.jpg",
  },
];

export default function Showcase() {
  const [active, setActive] = useState(0);

  return (
    <div className="showcase">
      <div className="left">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            className={i === active ? "item active" : "item"}
          >
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="right">
        <img src={items[active].image} alt="" />
      </div>
    </div>
  );
}
